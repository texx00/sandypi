from threading import Thread, Lock
import os
import time
import traceback
from collections import deque
from copy import deepcopy
import re
import logging
from dotenv import load_dotenv

from server.utils import limited_size_dict, buffered_timeout, settings_utils
from server.hw_controller.device_serial import DeviceSerial
from server.hw_controller.gcode_rescalers import Fit
import server.hw_controller.firmware_defaults as firmware

"""

This class duty is to send commands to the hw. It can be a single command or an entire drawing.


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



# List of commands that are buffered by the controller
BUFFERED_COMMANDS = ("G0", "G00", "G1", "G01", "G2", "G02", "G3", "G03", "G28")


class Feeder():
    def __init__(self, handler = None, **kargvs):
        # logger setup
        self.logger = logging.getLogger(__name__)
        logging.addLevelName(settings_utils.LINE_SENT, "LINE_SENT")
        logging.addLevelName(settings_utils.LINE_RECEIVED, "LINE_RECEIVED")
        # load logging level from environment variables
        load_dotenv()
        level = os.getenv("FEEDER_LEVEL")
        if not level is None:
            level = int(level)
        else:
            level = 0
        self.logger.setLevel(level)

        settings_utils.print_level(level, __name__.split(".")[-1])

        self._isrunning = False
        self._stopped = False
        self._ispaused = False
        self.total_commands_number = None
        self.command_number = 0
        self._th = None
        self.serial_mutex = Lock()
        self.status_mutex = Lock()
        if handler is None:
            self.handler = FeederEventHandler()
        else: self.handler = handler
        self.serial = None
        self.line_number = 0
        self._timeout_last_line = self.line_number
        self.feedrate = 0

        # commands parser
        self.feed_regex = re.compile("[F]([0-9.]+)($|\s)")

        # buffer controll attrs
        self.command_buffer = deque()
        self.command_buffer_mutex = Lock()              # mutex used to modify the command buffer
        self.command_send_mutex = Lock()                # mutex used to pause the thread when the buffer is full
        self.command_buffer_max_length = 8
        self.command_buffer_history = limited_size_dict.LimitedSizeDict(size_limit = self.command_buffer_max_length+10)    # keep saved the last n commands
        self.position_request_difference = 10           # every n lines requires the current position with M114
        self._timeout = buffered_timeout.BufferTimeout(30, self._on_timeout)
        self._timeout.start()

        # device specific options
        self.update_settings(settings_utils.load_settings())


    def update_settings(self, settings):
        self.settings = settings
        self._firmware = settings["serial"]["firmware"]
        self._ACK = firmware.get_ACK(self._firmware)
    
    def close(self):
        self.serial.close()

    def connect(self):
        self.logger.info("Connecting to serial device...")
        with self.serial_mutex:
            if not self.serial is None:
                self.serial.close()
            try:
                self.serial = DeviceSerial(self.settings['serial']['port'], self.settings['serial']['baud'], logger_name = __name__) 
                self._serial_read_thread = Thread(target = self._thsr, daemon=True)
                self._serial_read_thread.name = "serial_read"
                self._serial_read_thread.start()
            except:
                self.logger.info("Error during device connection")
                self.logger.info(traceback.print_exc())
                self.serial = DeviceSerial(logger_name = __name__)

        # wait for the device to be ready
        self.wait_device_ready()

        # reset line number when connecting
        self.reset_line_number()
        self.request_feedrate()
        # send the "on connection" script from the settings
        self.send_script(self.settings['scripts']['connected'])

    def wait_device_ready(self):
        time.sleep(1)
        # without this function the device may be not ready to receive commands

    def set_event_handler(self, handler):
        self.handler = handler

    # starts to send gcode to the machine
    def start_element(self, element, force_stop=False):
        if(not force_stop and self.is_running()):
            return False        # if a file is already being sent it will not start a new one
        else:
            if self.is_running():
                self.stop()     # stop -> blocking function: wait until the thread is stopped for real
            with self.serial_mutex:
                self._th = Thread(target = self._thf, args=(element,), daemon=True)
                self._th.name = "drawing_feeder"
                self._isrunning = True
                self._stopped = False
                self._ispaused = False
                self._current_element = element
                self.command_number = 0
                with self.command_buffer_mutex:
                    self.command_buffer.clear()
                self._th.start()
            self.handler.on_element_started(element)

    # ask if the feeder is already sending a file
    def is_running(self):
        with self.status_mutex:
            return self._isrunning

    # ask if the feeder is paused
    def is_paused(self):
        with self.status_mutex:
            return self._ispaused

    # return the code of the drawing on the go
    def get_element(self):
        with self.status_mutex:
            return self._current_element
    
    # stops the drawing
    # blocking function: waits until the thread is stopped
    def stop(self):
        if(self.is_running()):
            tmp = self._current_element
            with self.status_mutex:
                if not self._stopped:
                    self.logger.info("Stopping drawing")
                self._isrunning = False
                self._current_element = None
            # block the function until the thread is stopped otherwise the thread may still be running when the new thread is started 
            # (_isrunning will turn True and the old thread will keep going)
            while True:
                with self.status_mutex:
                    if self._stopped:
                        break
             # waiting command buffer to be clear before calling the "drawing ended" event
            while True:
                with self.command_buffer_mutex:
                    if len(self.command_buffer) == 0:
                        break
            # resetting line number between drawings
            self.reset_line_number()
            # calling "drawing ended" event
            self.handler.on_element_ended(tmp)
    
    # pause the drawing
    # can resume with "resume()"
    def pause(self):
        with self.status_mutex:
            self._ispaused = True
    
    # resume the drawing (only if used with "pause()" and not "stop()")
    def resume(self):
        with self.status_mutex:
            self._ispaused = False

    # thread function
    # TODO move this function in a different class
    def _thf(self, element):
        self.send_script(self.settings['scripts']['before'])

        self.logger.info("Starting new drawing with code {}".format(element))
        with self.serial_mutex:
            element = self._current_element
        
        # TODO retrieve saved information for the gcode filter
        dims = {"table_x":100, "table_y":100, "drawing_max_x":100, "drawing_max_y":100, "drawing_min_x":0, "drawing_min_y":0}
        # TODO calculate an estimate about the remaining time for the current drawing (for the moment can output the number of rows over the total number of lines in the file)
        self.total_commands_number = 10**6  # TODO change this placeholder

        filter = Fit(dims)
        
        for k, line in enumerate(element.execute()):        # execute the element (iterate over the commands or do what the element is designed for)
            line = line.upper()
            if not self.is_running():
                break
            while self.is_paused():
                time.sleep(0.1)
                # TODO parse line to scale/add padding to the drawing according to the drawing settings (in order to keep the original .gcode file)
                #line = filter.parse_line(line)
                #line = "N{} ".format(file_line) + line

            self.send_gcode_command(line)
        with self.status_mutex:
            self._stopped = True
        if self.is_running():
            self.send_script(self.settings['scripts']['after'])
            self.stop()

    # thread that keep reading the serial port
    def _thsr(self):
        line = ""
        l = None
        while True:
            with self.serial_mutex:
                try:
                    l = self.serial.readline()
                except Exception as e:
                    self.logger.error(e)
                    self.logger.error("Serial connection lost")
            if not l is None:
                # readline is not returning the full line but only a buffer 
                # must break the line on "\n" to correctly parse the result
                line += l
                if "\n" in line:
                    line = line.replace("\r", "").split("\n")
                    if len(line) >1:
                        for l in line[0:-1]:
                            self.parse_device_line(l)
                    line = line[-1]
            

    def _update_timeout(self):
        self._timeout_last_line = self.line_number
        self._timeout.update()
    
    def _on_timeout(self):
        # https://github.com/gnea/grbl/issues/666
        # on grbl can check buffer content
        # TODO check the buffer content instead of commands for the ack
        # need to set the bitmask with $10=something
        # the board will return <Stuff|Bf:rows in the buffer,Stuff>

        if (self.command_buffer_mutex.locked and self.line_number == self._timeout_last_line):
            # self.logger.warning("!Buffer timeout. Trying to clean the buffer!")
            # to clean the buffer try to send an M114 message. In this way will trigger the buffer cleaning mechanism
            command = firmware.get_buffer_command(self._firmware)
            line = self._generate_line(command, no_buffer=True)  # use the no_buffer to clean one position of the buffer after adding the command
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
        with self.command_buffer_mutex:
            if self.command_send_mutex.locked() and len(self.command_buffer) < self.command_buffer_max_length:
                self.command_send_mutex.release()

    # parse a line coming from the device
    def parse_device_line(self, line):
        if ("start" in line):
            self.wait_device_ready()
            self.reset_line_number()

        elif firmware.get_ACK(self._firmware) in line:  # when an "ack" is received free one place in the buffer
            self._ack_received()

        # TODO divide parser between firmwares?

        # Marlin resend command if a message is not received correctly
        elif "Resend: " in line:
            line_found = False
            line_number = int(line.replace("Resend: ", "").replace("\r\n", ""))
            items = deepcopy(self.command_buffer_history)
            for n, c in items.items():
                n_line_number = int(n.strip("N"))
                if n_line_number >= line_number:
                    line_found = True
                    # checks if the requested line is an M114. In that case do not need to print the error/resend command because its a wanted behaviour
                    #if line_number == n_line_number and "M114" in c:
                    #    print_line = False

                    # All the lines after the required one must be resent. Cannot break the loop now
                    with self.serial_mutex:
                        self.serial.send(c)
                    break
            self._ack_received(safe_line_number=line_number-1, append_left_extra=True)
            # the resend command is sending an ack. should add an entry to the buffer to keep the right lenght (because the line has been sent 2 times)
            if not line_found: 
                self.logger.error("No line was found for the number required. Restart numeration.")
                self.send_gcode_command("M110 N1")

        # TODO check feedrate response for M220 and set feedrate
        #elif "_______" in line: # must see the real output from marlin
        #    self.feedrate = .... # must see the real output from marlin

        # Marlin "unknow command"
        elif "echo:Unknown command:" in line:
            self.logger.error("Error: command not found. Can also be a communication error")

        # Grbl
        elif "error:" in line:
            self.logger.error("Grbl error: {}".format(line))
        
        self.logger.log(settings_utils.LINE_RECEIVED, line)
        self.handler.on_message_received(line)

    def get_status(self):
        with self.serial_mutex:
            return {"is_running":self._isrunning, "progress":[self.command_number, self.total_commands_number], "is_paused":self._ispaused, "is_connected":self.is_connected()}

    # depending on the firmware, generate a correct line to send to the board
    # args: 
    #  * command: the gcode command to send
    #  * no_buffer (def: False): will not save the line in the buffer (used to get an ack to clear the buffer after a timeout if an ack is lost)
    def _generate_line(self, command, no_buffer=False):
        line = command
        if (not (command.startswith("$") or command.startswith("?"))) or firmware.is_marlin(self._firmware):                 # filter grbl commands
            self.line_number += 1
            line = "N{} {} ".format(self.line_number, command)

        if firmware.is_marlin(self._firmware):
            # calculate marlin checksum according to the wiki
            cs = 0
            for i in line:
                cs = cs ^ ord(i)
            cs &= 0xff
            
            line +="*{}\n".format(cs)                   # add checksum to the line
        else: line +="\n"

        # store the line in the buffer
        with self.command_buffer_mutex:
            self.command_buffer.append(self.line_number)
            self.command_buffer_history["N{}".format(self.line_number)] = line
            if no_buffer:
                self.command_buffer.popleft()   # remove an element to get a free ack from the non buffered command. Still must keep it in the buffer in the case of an error in sending the line

        return line

    def send_gcode_command(self, command):
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
        if any(code in command for code in BUFFERED_COMMANDS):
            if "F" in command:
                feed = self.feed_regex.findall(command)
                self.feedrate = feed[0][0]

            with self.command_send_mutex:       # wait until get some "ok" command to remove an element from the buffer
                pass

        # send the command after parsing the content
        # need to use the mutex here because it is changing also the line number
        with self.serial_mutex:
            # check if needs to send a "M114" command (actual position request) but not in the first lines
            if (self.line_number % self.position_request_difference) == 0 and self.line_number > 5:
                #self._generate_line("M114")    # does not send the line to trigger the "resend" event and clean the buffer from messages that are already done
                pass

            line = self._generate_line(command)

            self.serial.send(line)              # send line
            self.logger.log(settings_utils.LINE_SENT, line.replace("\n", "")) 

            # TODO fix the problem with small geometries may be with the serial port being to slow. For long (straight) segments the problem is not evident. Do not understand why it is happening

            self._update_timeout()              # update the timeout because a new command has been sent

            with self.command_buffer_mutex:
                if(len(self.command_buffer)>=self.command_buffer_max_length and not self.command_send_mutex.locked()):
                    self.command_send_mutex.acquire()     # if the buffer is full acquire the lock so that cannot send new lines until the reception of an ack. Notice that this will stop only buffered commands. The other commands will be sent anyway
    
            self.handler.on_new_line(line)      # uses the handler callback for the new line

    # Send a multiline script
    def send_script(self, script):
        self.logger.info("Sending script")
        script = script.split("\n")
        for s in script:
            if s != "" and s != " ":
                self.send_gcode_command(s)

    def reset_line_number(self, line_number = 2):
        self.logger.info("Resetting line number")
        self.send_gcode_command("M110 N{}".format(line_number))
    
    def request_feedrate(self):
        self.send_gcode_command("M220")

    def serial_ports_list(self):
        result = self.serial.serial_port_list()
        return [] if result is None else result
    
    def is_connected(self):
        return self.serial.is_connected()