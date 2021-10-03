from threading import Thread, Lock
import os
import time
import traceback
from collections import deque
from copy import deepcopy
import re
import logging
from dotenv import load_dotenv
from dotmap import DotMap
from py_expression_eval import Parser

from server.utils import limited_size_dict, buffered_timeout, settings_utils
from server.utils.logging_utils import formatter, MultiprocessRotatingFileHandler
from server.hw_controller.device_serial import DeviceSerial
from server.hw_controller.gcode_rescalers import Fit
import server.hw_controller.firmware_defaults as firmware
from server.database.playlist_elements import DrawingElement, TimeElement
from server.database.generic_playlist_element import UNKNOWN_PROGRESS

"""

This class duty is to send commands to the hw. It can handle single commands as well as elements.


"""


class FeederEventHandler():
    # called when the drawing is finished
    def on_element_ended(self, element):
        pass

    # called when a new drawing is started
    def on_element_started(self, element):
        pass
    
    # called when the feeder receives a message from the hw that must be sent to the frontend
    def on_message_received(self, line):
        pass

    # called when a new line is sent through serial (real or fake)
    def on_new_line(self, line):
        pass

    def on_device_ready(self):
        pass



# List of commands that are buffered by the controller
BUFFERED_COMMANDS   = ("G0", "G00", "G1", "G01", "G2", "G02", "G3", "G03", "G28")
# Defines the character used to define macros
MACRO_CHAR          = "&"

class Feeder():
    def __init__(self, handler = None, **kargvs):

        # logger setup
        self.logger = logging.getLogger(__name__)
        self.logger.handlers = []           # remove all handlers
        self.logger.propagate = False       # set it to False to avoid passing it to the parent logger
        # add custom logging levels
        logging.addLevelName(settings_utils.LINE_SENT, "LINE_SENT")
        logging.addLevelName(settings_utils.LINE_RECEIVED, "LINE_RECEIVED")
        logging.addLevelName(settings_utils.LINE_SERVICE, "LINE_SERVICE")
        self.logger.setLevel(settings_utils.LINE_SERVICE)             # set to logger lowest level

        # create file logging handler
        file_handler = MultiprocessRotatingFileHandler("server/logs/feeder.log", maxBytes=200000, backupCount=5)
        file_handler.setLevel(settings_utils.LINE_SERVICE)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        # load sterr logging level from environment variables
        load_dotenv()
        level = os.getenv("FEEDER_LEVEL")
        if not level is None:
            level = int(level)
        else:
            level = 0

        # create stream handler
        stream_handler = logging.StreamHandler()
        stream_handler.setLevel(level)
        stream_handler.setFormatter(formatter)
        self.logger.addHandler(stream_handler)

        settings_utils.print_level(level, __name__.split(".")[-1])


        # variables setup

        self._current_element = None
        self._is_running = False
        self._stopped = False
        self._is_paused = False
        self._th = None
        self.serial_mutex = Lock()
        self.status_mutex = Lock()
        if handler is None:
            self.handler = FeederEventHandler()
        else: self.handler = handler
        self.serial = DeviceSerial(logger_name = __name__)
        self.line_number = 0
        self._timeout_last_line = self.line_number
        self.feedrate = 0
        self.last_commanded_position = DotMap({"x":0, "y":0})

        # commands parser
        self.feed_regex =   re.compile("[F]([0-9.-]+)($|\s)")           # looks for a +/- float number after an F, until the first space or the end of the line
        self.x_regex =      re.compile("[X]([0-9.-]+)($|\s)")           # looks for a +/- float number after an X, until the first space or the end of the line
        self.y_regex =      re.compile("[Y]([0-9.-]+)($|\s)")           # looks for a +/- float number after an Y, until the first space or the end of the line
        self.macro_regex =  re.compile(MACRO_CHAR+"(.*?)"+MACRO_CHAR)   # looks for stuff between two "%" symbols. Used to parse macros
        
        self.macro_parser = Parser()                                    # macro expressions parser

        # buffer controll attrs
        self.command_buffer = deque()
        self.command_buffer_mutex = Lock()              # mutex used to modify the command buffer
        self.command_send_mutex = Lock()                # mutex used to pause the thread when the buffer is full
        self.command_buffer_max_length = 8
        self.command_buffer_history = limited_size_dict.LimitedSizeDict(size_limit = self.command_buffer_max_length+40)    # keep saved the last n commands
        self._buffered_line = ""

        self._timeout = buffered_timeout.BufferTimeout(30, self._on_timeout)
        self._timeout.start()

        # device specific options
        self.update_settings(settings_utils.load_settings())


    def update_settings(self, settings):
        self.settings = settings
        self._firmware = settings["device"]["firmware"]["value"]
        self._ACK = firmware.get_ACK(self._firmware)
        self._timeout.set_timeout_period(firmware.get_buffer_timeout(self._firmware))
        self.is_fast_mode = settings["serial"]["fast_mode"]["value"]
        if self.is_fast_mode:
            if settings["device"]["type"]["value"] == "Cartesian":
                self.command_resolution = "{:.1f}"      # Cartesian do not need extra resolution because already using mm as units. (TODO maybe with inches can have problems? needs to check)
            else: self.command_resolution = "{:.3f}"    # Polar and scara use smaller numbers, will need also decimals
    
    def close(self):
        self.serial.close()

    def get_status(self):
        with self.status_mutex:
            return {
                "is_running": self._is_running, 
                "progress": self._current_element.get_progress(self.feedrate) if not self._current_element is None else UNKNOWN_PROGRESS,
                "is_paused": self._is_paused
            }

    def connect(self):
        self.logger.info("Connecting to serial device...")
        with self.serial_mutex:
            if not self.serial is None:
                self.serial.close()
            try:
                self.serial = DeviceSerial(self.settings['serial']['port']["value"], self.settings['serial']['baud']["value"], logger_name = __name__) 
                self.serial.set_onreadline_callback(self.on_serial_read)
                self.serial.start_reading()
                self.logger.info("Connection successfull")
            except:
                self.logger.info("Error during device connection")
                self.logger.info(traceback.print_exc())
                self.serial = DeviceSerial(logger_name = __name__)
                self.serial.set_onreadline_callback(self.on_serial_read)
                self.serial.start_reading()

        self.device_ready = False   # this line is set to true as soon as the board sends a message


    def set_event_handler(self, handler):
        self.handler = handler

    # starts to send gcode to the machine
    def start_element(self, element, force_stop=False):
        if((not force_stop) and self.is_running()):
            return False        # if a file is already being sent it will not start a new one
        else:
            if self.is_running():
                self.stop()     # stop -> blocking function: wait until the thread is stopped for real
            with self.serial_mutex:
                self._th = Thread(target = self._thf, args=(element,), daemon=True)
                self._th.name = "drawing_feeder"
                self._is_running = True
                self._stopped = False
                self._is_paused = False
                self._current_element = element
                if self.command_send_mutex.locked():
                    self.command_send_mutex.release()
                with self.command_buffer_mutex:
                    self.command_buffer.clear()
                self._th.start()
            self.handler.on_element_started(element)

    # ask if the feeder is already sending a file
    def is_running(self):
        with self.status_mutex:
            return self._is_running

    # ask if the feeder is paused
    def is_paused(self):
        with self.status_mutex:
            return self._is_paused

    # return the code of the drawing on the go
    def get_element(self):
        with self.status_mutex:
            return self._current_element

    def update_current_time_element(self, new_interval):
        with self.status_mutex:
            if type(self._current_element) is TimeElement:
                if self._current_element.type == "delay":
                    self._current_element.update_delay(new_interval)
    
    # stops the drawing
    # blocking function: waits until the thread is stopped
    def stop(self):
        if(self.is_running()):
            tmp = self._current_element
            with self.status_mutex:
                if not self._stopped:
                    self.logger.info("Stopping drawing")
                self._is_running = False
                self._current_element = None
            # block the function until the thread is stopped otherwise the thread may still be running when the new thread is started 
            # (_isrunning will turn True and the old thread will keep going)
            while True:
                with self.status_mutex:
                    if self._stopped:
                        break

            # waiting command buffer to be clear before calling the "drawing ended" event
            while True:
                self.send_gcode_command(firmware.get_buffer_command(self._firmware), hide_command=True) 
                time.sleep(3)                                               # wait 3 second to get the time to the board to answer. If the time here is reduced too much will fill the buffer history with buffer_commands and may loose the needed line in a resend command for marlin
                # the "buffer_command" will raise a response from the board that will be handled by the parser to empty the buffer

                # wait until the buffer is empty to know that the job is done
                with self.command_buffer_mutex:
                    if len(self.command_buffer) == 0:
                        break
            # resetting line number between drawings
            self._reset_line_number()
            # calling "drawing ended" event
            self.handler.on_element_ended(tmp)
    
    
    # pauses the drawing
    # can resume with "resume()"
    def pause(self):
        with self.status_mutex:
            self._is_paused = True
        self.logger.info("Paused")
    
    # resumes the drawing (only if used with "pause()" and not "stop()")
    def resume(self):
        with self.status_mutex:
            self._is_paused = False
        self.logger.info("Resumed")

    # function to prepare the command to be sent.
    #  * command: command to send
    #  * hide_command=False (optional): will hide the command from being sent also to the frontend (should be used for SW control commands)
    def send_gcode_command(self, command, hide_command=False):
        command = self._parse_macro(command)

        if "G28" in command:
            self.last_commanded_position.x = 0
            self.last_commanded_position.y = 0
        # TODO add G92 check for the positioning

        # clean the command a little
        command = command.replace("\n", "").replace("\r", "").upper()
        if command == " " or command == "":
            return
        
        # some commands require to update the feeder status
        # parse the command if necessary
        if "M110" in command:
            cs = command.split(" ")
            for c in cs:
                if c[0]=="N":
                    self.line_number = int(c[1:]) -1
                    self.command_buffer.clear()

        # check if the command is in the "BUFFERED_COMMANDS" list and stops if the buffer is full
        try:
            if any(code in command for code in BUFFERED_COMMANDS):
                if "F" in command:
                    self.feedrate = float(self.feed_regex.findall(command)[0][0])
                if "X" in command:
                    self.last_commanded_position.x = float(self.x_regex.findall(command)[0][0])
                if "Y" in command:
                    self.last_commanded_position.y = float(self.y_regex.findall(command)[0][0])
        except:
            self.logger.error("Cannot parse something in the command: " + command)
        # wait until the lock for the buffer length is released -> means the board sent the ack for older lines and can send new ones
        with self.command_send_mutex:       # wait until get some "ok" command to remove extra entries from the buffer
            pass

        # send the command after parsing the content
        # need to use the mutex here because it is changing also the line number
        with self.serial_mutex:
            line = self._generate_line(command)

            self.serial.send(line)              # send line
            self.logger.log(settings_utils.LINE_SENT, line.replace("\n", "")) 

            # TODO fix the problem with small geometries may be with the serial port being to slow. For long (straight) segments the problem is not evident. Do not understand why it is happening

        with self.command_buffer_mutex:
            if(len(self.command_buffer)>=self.command_buffer_max_length and not self.command_send_mutex.locked()):
                self.command_send_mutex.acquire()     # if the buffer is full acquire the lock so that cannot send new lines until the reception of an ack. Notice that this will stop only buffered commands. The other commands will be sent anyway

        if not hide_command:
            self.handler.on_new_line(line)      # uses the handler callback for the new line
            
        if firmware.is_marlin(self._firmware):  # updating the command only for marlin because grbl check periodically the buffer status with the status report command
            self._update_timeout()              # update the timeout because a new command has been sent


    
    # Send a multiline script
    def send_script(self, script):
        self.logger.info("Sending script")
        script = script.split("\n")
        for s in script:
            if s != "" and s != " ":
                self.send_gcode_command(s)

    def serial_ports_list(self):
        result = []
        if not self.serial is None:
            result = self.serial.serial_port_list()
        return result
    
    def is_connected(self):
        with self.serial_mutex:
            return self.serial.is_connected()

    # stops immediately the device
    def emergency_stop(self):
        self.send_gcode_command(firmware.get_emergency_stop_command(self._firmware))
        # TODO add self.close() ?

    # ----- PRIVATE METHODS -----

    # prepares the board
    def _on_device_ready(self):
        if firmware.is_marlin(self._firmware):
            self._reset_line_number()
        
        # grbl status report mask setup
        # sandypi need to check the buffer to see if the machine has cleaned the buffer
        # setup grbl to show the buffer status with the $10 command
        #   Grbl 1.1 https://github.com/gnea/grbl/wiki/Grbl-v1.1-Configuration
        #   Grbl 0.9 https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.9
        # to be compatible with both will send $10=6 (4(for v0.9) + 2(for v1.1))
        # the status will then be prompted with the "?" command when necessary
        # the buffer will contain Bf:"usage of the buffer"
        if firmware.is_grbl(self._firmware):
            self.send_gcode_command("$10=6")
        
        # send the "on connection" script from the settings
        self.send_script(self.settings['scripts']['connected']["value"])

        # device ready event
        self.handler.on_device_ready()

    # run the "_on_device_ready" method with a delay
    def _on_device_ready_delay(self):
        def delay():
            time.sleep(5)
            self._on_device_ready()
        th = Thread(target = delay, daemon=True)
        th.name = "waiting_device_ready"
        th.start()

    # thread function
    # TODO move this function in a different class?
    def _thf(self, element):
        # runs the script only it the element is a drawing, otherwise will skip the "before" script
        if isinstance(element, DrawingElement):
            self.send_script(self.settings['scripts']['before']["value"])

        self.logger.info("Starting new drawing with code {}".format(element))
        
        # TODO retrieve saved information for the gcode filter
        dims = {"table_x":100, "table_y":100, "drawing_max_x":100, "drawing_max_y":100, "drawing_min_x":0, "drawing_min_y":0}
        
        filter = Fit(dims)
        
        for k, line in enumerate(self.get_element().execute(self.logger)):     # execute the element (iterate over the commands or do what the element is designed for)
            if not self.is_running():
                break
            
            if line is None:                                        # if the line is none there is no command to send, will continue with the next element execution (for example, within the delay element it will sleep 1s at a time and return None until the timeout passed. TODO Not really an efficient way, may change it in the future)
                continue

            line = line.upper()

            self.send_gcode_command(line)

            while self.is_paused():
                time.sleep(0.1)
                # if a "stop" command is raised must exit the pause and stop the drawing
                if not self.is_running():
                    break

            # TODO parse line to scale/add padding to the drawing according to the drawing settings (in order to keep the original .gcode file)
            #line = filter.parse_line(line)
            #line = "N{} ".format(file_line) + line
        with self.status_mutex:
            self._stopped = True
        
        # runs the script only it the element is a drawing, otherwise will skip the "after" script
        if isinstance(element, DrawingElement):
            self.send_script(self.settings['scripts']['after']["value"])
        if self.is_running():
            self.stop()

    # thread that keep reading the serial port
    def on_serial_read(self, l):
        if not l is None:
            # readline is not returning the full line but only a buffer 
            # must break the line on "\n" to correctly parse the result
            self._buffered_line += l
            if "\n" in self._buffered_line:
                self._buffered_line = self._buffered_line.replace("\r", "").split("\n")
                if len(self._buffered_line) >1:
                    for l in self._buffered_line[0:-1]: # parse single lines if multiple \n are detected
                        self._parse_device_line(l)
                self._buffered_line = str(self._buffered_line[-1])
            

    def _update_timeout(self):
        self._timeout_last_line = self.line_number
        self._timeout.update()
    

    # function called when the buffer has not been updated for some time (controlled by the buffered timeou)
    def _on_timeout(self):
        if (self.command_buffer_mutex.locked and self.line_number == self._timeout_last_line and not self.is_paused()):
            # self.logger.warning("!Buffer timeout. Trying to clean the buffer!")
            # to clean the buffer try to send an M114 (marlin) or ? (Grbl) message. In this way will trigger the buffer cleaning mechanism
            command = firmware.get_buffer_command(self._firmware)
            line = self._generate_line(command, no_buffer=True)  # use the no_buffer to clean one position of the buffer after adding the command
            self.logger.log(settings_utils.LINE_SERVICE, line)
            with self.serial_mutex:                
                self.serial.send(line)
        else:
            self._update_timeout()

    def _ack_received(self, safe_line_number=None, append_left_extra=False):
        if safe_line_number is None:
            with self.command_buffer_mutex:
                if len(self.command_buffer) != 0:
                    self.command_buffer.popleft()
        else:
            with self.command_buffer_mutex:   
                while True:
                    # Remove the numbers lower than the specified safe_line_number (used in the resend line command: lines older than the one required can be deleted safely)
                    if len(self.command_buffer) != 0:
                        line_number = self.command_buffer.popleft()
                        if line_number >= safe_line_number:
                            self.command_buffer.appendleft(line_number)
                            break
                if append_left_extra:
                    self.command_buffer.appendleft(safe_line_number-1)

        self._check_buffer_mutex_status()


    # check if the buffer of the device is full or can accept more commands
    def _check_buffer_mutex_status(self):
        with self.command_buffer_mutex:
            if self.command_send_mutex.locked() and len(self.command_buffer) < self.command_buffer_max_length:
                self.command_send_mutex.release()
        

    # parse a line coming from the device
    def _parse_device_line(self, line):
        # setting to avoid sending the message to the frontend in particular situations (i.e. status checking in grbl)
        # will still print the status in the command line
        hide_line = False

        if firmware.get_ACK(self._firmware) in line:  # when an "ack" is received free one place in the buffer
            self._ack_received()
        
        # check if the received line is for the device being ready
        if firmware.get_ready_message(self._firmware) in line:
            if self.serial.is_fake:
                self._on_device_ready()
            else:
                self._on_device_ready_delay()   # if the device is ready will allow the communication after a small delay

        # check marlin specific messages
        if firmware.is_grbl(self._firmware):
            if line.startswith("<"):
                try:
                    # interested in the "Bf:xx," part where xx is the content of the buffer
                    # select buffer content lines 
                    res = line.split("Bf:")[1]
                    res = int(res.split(",")[0])
                    if res == 15: # 15 => buffer is empty on the device (should include also 14 to make it more flexible?)
                        with self.command_buffer_mutex:
                            self.command_buffer.clear()
                    if res!= 0:  # 0 -> buffer is full
                        with self.command_buffer_mutex:
                            if len(self.command_buffer) > 0 and self.is_running():
                                self.command_buffer.popleft()
                    self._check_buffer_mutex_status()
                    
                    if (self.is_running() or self.is_paused()):
                        hide_line = True
                    self.logger.log(settings_utils.LINE_SERVICE, line)
                except: # sometimes may not receive the entire line thus it may throw an error
                    pass
                return

            # errors
            elif "error:22" in line:
                self.stop()
                with self.command_buffer_mutex:
                    self.command_buffer.clear()
            elif "error:" in line:
                self.logger.error("Grbl error: {}".format(line))
                # TODO check/parse error types and give some hint about the problem?


        # TODO divide parser between firmwares?
        # TODO set firmware type automatically on connection
        # TODO add feedrate control with something like a knob on the user interface to make the drawing slower or faster

        # Marlin messages
        else:
            # Marlin resend command if a message is not received correctly
            # Quick note: if the buffer_command is sent too often will fill the buffer with "M114" and if a line is request will not be able to send it back
            # TODO Should add some sort of filter that if the requested line number is older than the requested ones can send from that number to the first an empty command or the buffer_command
            # Otherwise should not put a buffer_command in the buffer and if a line with the requested number should send the buffer_command
            if "Resend: " in line:
                line_found = False
                line_number = int(line.replace("Resend: ", "").replace("\r\n", ""))
                items = deepcopy(self.command_buffer_history)
                missing_lines = True
                first_available_line = None
                for n, c in items.items():
                    n_line_number = int(n.strip("N"))
                    if n_line_number == line_number:
                        line_found = True
                    if n_line_number >= line_number:
                        if first_available_line is None:
                            first_available_line = line_number
                        # All the lines after the required one must be resent. Cannot break the loop now
                        self.serial.send(c)
                        self.logger.error("Line not received correctly. Resending: {}".format(c.strip("\n")))

                if (not line_found) and not(first_available_line is None):
                    for i in range(line_number, first_available_line):
                        self.serial.send(self._generate_line(firmware.MARLIN.buffer_command, no_buffer=True, n=i))

                self._ack_received(safe_line_number=line_number-1, append_left_extra=True)
                # the resend command is sending an ack. should add an entry to the buffer to keep the right lenght (because the line has been sent 2 times)
                if not line_found: 
                    self.logger.error("No line was found for the number required. Restart numeration.")
                    self._reset_line_number()

            # Marlin "unknow command"
            elif "echo:Unknown command:" in line:
                self.logger.error("Error: command not found. Can also be a communication error")
            # M114 response contains the "Count" word
            # the response looks like: X:115.22 Y:116.38 Z:0.00 E:0.00 Count A:9218 B:9310 Z:0
            # still, M114 will receive the last position in the look-ahead planner thus the drawing will end first on the interface and then in the real device
            elif "Count" in line:
                try:
                    l = line.split(" ")
                    x = float(l[0][2:])     # remove "X:" from the string
                    y = float(l[1][2:])     # remove "Y:" from the string
                except Exception as e:
                    self.logger.error("Error while parsing M114 result for line: {}".format(line))
                    self.logger.exception(e)

                # if the last commanded position coincides with the current position it means the buffer on the device is empty (could happen that the position is the same between different points but the M114 command should not be that frequent to run into this problem.) TODO check if it is good enough or if should implement additional checks like a timeout
                # use a tolerance instead of equality because marlin is using strange rounding for the coordinates
                if (abs(float(self.last_commanded_position.x)-x)<firmware.MARLIN.position_tolerance) and (abs(float(self.last_commanded_position.y)-y)<firmware.MARLIN.position_tolerance):
                    if self.is_running():
                        self._ack_received()
                    else:
                        with self.command_buffer_mutex:
                            self.command_buffer.clear()
                        self._check_buffer_mutex_status()

                if not self.is_running():
                    hide_line = True
                
        
            # TODO check feedrate response for M220 and set feedrate
            #elif "_______" in line: # must see the real output from marlin
            #    self.feedrate = .... # must see the real output from marlin

        self.logger.log(settings_utils.LINE_RECEIVED, line)
        if not hide_line:
            self.handler.on_message_received(line)

    # depending on the firmware, generates a correct line to send to the board
    # args: 
    #  * command: the gcode command to send
    #  * no_buffer (def: False): will not save the line in the buffer (used to get an ack to clear the buffer after a timeout if an ack is lost)
    def _generate_line(self, command, no_buffer=False, n=None):
        line = command
        # TODO add a "fast mode" remove spaces from commands and reduce number of decimals
        # removing spaces is in conflict with the emulator... Need to update the parser there also
        # fast mode test
        if self.is_fast_mode:
            line = command.split(" ")
            new_line = []
            for l in line:
                if l.startswith("X"):
                    l = "X" + self.command_resolution.format(float(l[1:])).rstrip("0").rstrip(".")
                elif l.startswith("Y"):
                    l = "Y" + self.command_resolution.format(float(l[1:])).rstrip("0").rstrip(".")
                new_line.append(l)
            line = "".join(new_line)

        # marlin needs line numbers and checksum (grbl doesn't)
        if firmware.is_marlin(self._firmware):
            # add line number
            if n is None:   # check if the line number was specified or if must increase the number of the sequential command
                self.line_number += 1
                n = self.line_number
            if self.is_fast_mode:
                line = "N{}{}".format(n, line)
            else: line = "N{} {} ".format(n, line)
            # calculate marlin checksum according to the wiki
            cs = 0
            for i in line:
                cs = cs ^ ord(i)
            cs &= 0xff
            
            line +="*{}\n".format(cs)                   # add checksum to the line

        elif firmware.is_grbl(self._firmware):
            if line != firmware.GRBL.buffer_command:
                line += "\n"

        else: line += "\n"

        # store the line in the buffer
        with self.command_buffer_mutex:
            self.command_buffer.append(self.line_number)
            self.command_buffer_history["N{}".format(self.line_number)] = line
            if no_buffer:
                self.command_buffer.popleft()   # remove an element to get a free ack from the non buffered command. Still must keep it in the buffer in the case of an error in sending the line

        return line

    def _reset_line_number(self, line_number = 2):
        # Marlin may require to reset the line numbers
        if firmware.is_marlin(self._firmware):
            self.logger.info("Resetting line number")
            self.send_gcode_command("M110 N{}".format(line_number))
        # Grbl do not use line numbers

    def _parse_macro(self, command):
        if not MACRO_CHAR in command:
            return command
        macros = self.macro_regex.findall(command)
        for m in macros:
            try:
                # see https://pypi.org/project/py-expression-eval/ for more info about the parser
                res = self.macro_parser.parse(m).evaluate({
                    "X": self.last_commanded_position.x, 
                    "x": self.last_commanded_position.x,
                    "Y": self.last_commanded_position.y, 
                    "y": self.last_commanded_position.y,
                    "F": self.feedrate,
                    "f": self.feedrate
                })
                command = command.replace(MACRO_CHAR + m + MACRO_CHAR, str(res))
            except Exception as e:
                self.logger.error("Error while parsing macro: " + m)
                self.logger.error(e)
        return command