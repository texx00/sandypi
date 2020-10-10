from threading import Thread, Lock
import os
import sys
sys.path.insert(1, os.path.join(sys.path[0], '..'))
import glob
from pathlib import Path
from UIserver.hw_controller.gcode_rescalers import *
import time
import serial.tools.list_ports
import serial
import atexit
import traceback
import json
from utils import settings_utils
from collections import OrderedDict, deque
from copy import deepcopy


"""

This class duty is to send commands to the hw. It can be a single command or an entire drawing.


"""

# TODO use different logger


class FeederEventHandler():
    # called when the drawing is finished
    def on_drawing_ended(self, code):
        pass

    # called when a new drawing is started
    def on_drawing_started(self, code):
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
        self._print_ack = kargvs.pop("print_ack", False)
        self._print_ack = True
        self._isrunning = False
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

        # buffer control attrs
        self.command_buffer = deque()
        self.command_buffer_mutex = Lock()  # mutex used to modify the command buffer
        self.command_send_mutex = Lock()    # mutex used to pause the thread when the buffer is full
        self.command_buffer_max_length = 8
        self.command_buffer_history = LimitedSizeDict(size_limit = self.command_buffer_max_length+10)    # keep saved the last n commands
        self.position_request_difference = 10          # every n lines requires the current position with M114
        self._timeout = BufferTimeout(20, self._on_timeout)
        self._timeout.start()
    
    def close(self):
        self.serial.close()

    def connect(self):
        print("Connecting to serial device...")
        settings = settings_utils.load_settings()
        with self.serial_mutex:
            if not self.serial is None:
                self.serial.close()
            try:
                self.serial = DeviceSerial(settings['serial']['port'], settings['serial']['baud']) 
                self._serial_read_thread = Thread(target = self._thsr, daemon=True)
                self._serial_read_thread.start()
            except:
                print("Error during device connection")
                print(traceback.print_exc())
                self.serial = DeviceSerial()

        # wait for the device to be ready
        self.wait_device_ready()

        # reset line number when connecting
        self.reset_line_number()
        # send the "on connection" script from the settings
        self.send_script(settings['scripts']['connection'])

    def wait_device_ready(self):
        time.sleep(1) # TODO make it better
        # without this function the device may be not ready to receive commands

    def set_event_handler(self, handler):
        self.handler = handler

    # starts to send gcode to the machine
    def start_code(self, code, force_stop=False):
        if(not force_stop and self.is_running()):
            return False    # if a file is already being sent it will not start a new one
        else:
            if self.is_running():
                self.stop()
                time.sleep(5)       # wait a little for the thread to stop
            with self.serial_mutex:
                self._th = Thread(target = self._thf, args=(code,), daemon=True)
                self._isrunning = True
                self._ispaused = False
                self._running_code = code
                self.command_number = 0
                with self.command_buffer_mutex:
                    self.command_buffer.clear()
                self._th.start()
            self.handler.on_drawing_started(code)

    # ask if the feeder is already sending a file
    def is_running(self):
        with self.status_mutex:
            return self._isrunning

    # ask if the feeder is paused
    def is_paused(self):
        with self.status_mutex:
            return self._ispaused

    # return the code of the drawing on the go
    def get_drawing_code(self):
        with self.status_mutex:
            return self._running_code
    
    # stops the drawing
    def stop(self):
        if(self.is_running()):
            with self.status_mutex:
                self._isrunning = False
    
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
    def _thf(self, code):
        settings = settings_utils.load_settings()
        self.send_script(settings['scripts']['before'])

        print("Starting new drawing with code {}".format(code))
        with self.serial_mutex:
            code = self._running_code
        filename = os.path.join(str(Path(__file__).parent.parent.absolute()), "static/Drawings/{0}/{0}.gcode".format(code))
        
        # TODO retrieve saved information for the gcode filter
        dims = {"table_x":100, "table_y":100, "drawing_max_x":100, "drawing_max_y":100, "drawing_min_x":0, "drawing_min_y":0}
        # TODO calculate an estimate about the remaining time for the current drawing (for the moment can output the number of rows over the total number of lines in the file)
        self.total_commands_number = 10**6  # TODO change this placeholder

        filter = Fit(dims)
        
        with open(filename, "r") as file:
            file_line = 1
            for k, line in enumerate(file):
                line = line.upper()
                if not self.is_running():
                    break
                while self.is_paused():
                    time.sleep(1)
                if not line[0]==";":
                    # TODO parse line to scale/add padding to the drawing according to the drawing settings (in order to keep the original .gcode file)
                    #line = filter.parse_line(line)
                    #line = "N{} ".format(file_line) + line

                    self.send_gcode_command(line)
        self.send_script(settings['scripts']['after'])
        self.handler.on_drawing_ended(code)
        self.stop()

    # thread that keep reading the serial port
    def _thsr(self):
        while True:
            with self.serial_mutex:
                try:
                    line = self.serial.readline()
                except Exception as e:
                    print(e)
                    print("Serial connection lost")
            if not line is None:
                self.parse_device_line(line)

    def _update_timeout(self):
        self._timeout_last_line = self.line_number
        self._timeout.update()
    
    def _on_timeout(self):
        if (self.command_buffer_mutex.locked and self.line_number == self._timeout_last_line):
            print("!Buffer timeout. Try to clean the buffer!")
            # to clean the buffer try to send an M114 message. In this way will trigger the buffer cleaning mechanism
            line = self._generate_line("M114")  # may need to send it twice? could also send an older line to trigger the error?
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
        print_line = True
        if ("start" in line):
            self.wait_device_ready()
            self.reset_line_number()

        elif "ok" in line:  # when an "ack" is received free one place in the buffer
            self._ack_received()
            if not self._print_ack:
                print_line = False

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
                print("No line was found for the number required. Restart numeration.")
                self.send_gcode_command("M110 N1")
                print_line = False

        elif "echo:Unknown command:" in line:
            print("Error: command not found. Can also be a communication error")
        
        if print_line:
            print(line) 
        self.handler.on_message_received(line)

    def get_status(self):
        with self.serial_mutex:
            return {"is_running":self._isrunning, "progress":[self.command_number, self.total_commands_number], "is_paused":self._ispaused, "is_connected":self.is_connected()}

    def _generate_line(self, command):
        self.line_number += 1
        line = "N{} {} ".format(self.line_number, command)

        # calculate checksum according to the wiki
        cs = 0
        for i in line:
            cs = cs ^ ord(i)
        cs &= 0xff
        
        line +="*{}\n".format(cs)   # add checksum to the line

        # store the line in the buffer
        with self.command_buffer_mutex:
            self.command_buffer.append(self.line_number)
            self.command_buffer_history["N{}".format(self.line_number)] = line

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
            with self.command_send_mutex:     # wait until get some "ok" command to remove an element from the buffer
                pass

        # send the command after parsing the content
        # need to use the mutex here because it is changing also the line number
        with self.serial_mutex:
            # check if needs to send a "M114" command (actual position request) but not in the first lines
            if (self.line_number % self.position_request_difference) == 0 and self.line_number > 5:
                #self._generate_line("M114")  # does not send the line to trigger the "resend" event and clean the buffer from messages that are already done
                pass

            line = self._generate_line(command)

            self.serial.send(line)      # send line

            # TODO the problem with small geometries may be with the serial port being to slow. For long (straight) segments the problem is not evident

            self._update_timeout()      # update the timeout because a new command has been sent

            with self.command_buffer_mutex:
                if(len(self.command_buffer)>=self.command_buffer_max_length):
                    self.command_send_mutex.acquire()     # if the buffer is full acquire the lock so that cannot send new lines until the reception of an ack. Notice that this will stop only buffered commands. The other commands will be sent anyway
    
            self.handler.on_new_line(line)  # uses the handler callback for the new line

    # Send a multiline script
    def send_script(self, script):
        print("Sending script: ")
        script = script.split("\n")
        for s in script:
            print("> " + s)
            if s != "" and s != " ":
                self.send_gcode_command(s)

    def reset_line_number(self, line_number = 2):
        print("Resetting line number")
        self.send_gcode_command("M110 N{}".format(line_number))

    def serial_ports_list(self):
        result = self.serial.serial_port_list()
        return [] if result is None else result
    
    def is_connected(self):
        return self.serial.is_connected()

class DeviceSerial():
    def __init__(self, serialname = None, baudrate = None):
        self.serialname = serialname
        self.baudrate = baudrate
        self.is_fake = False
        self._buffer = bytearray()
        self.echo = ""
        try:
            args = dict(
                baudrate = self.baudrate,
                timeout = 0,
                write_timeout = 0
            )
            self.serial = serial.Serial(**args)
            self.serial.port = self.serialname
            self.serial.open()
            print("Serial device connected")
        except:
            #print(traceback.print_exc())
            self.is_fake = True
            print("Serial not available. Will use the fake serial")

    def send(self, obj):
        if self.is_fake:
            print("Fake> " + str(obj))
            self.echo = obj
            time.sleep(0.05)
        else:
            if self.serial.is_open:
                try:
                    while self.readline():
                        pass
                    self.serial.write(str(obj).encode())
                except:
                    self.close()
                    print("Error while sending a command")
    
    def serial_port_list(self):
        if sys.platform.startswith('win'):
            plist = serial.tools.list_ports.comports()
            ports = [port.device for port in plist]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            # this excludes your current terminal "/dev/tty"
            ports = glob.glob('/dev/tty[A-Za-z]*')
        else:
            raise EnvironmentError('Unsupported platform')
        return ports

    def is_connected(self):
        if(self.is_fake):
            return False
        return self.serial.is_open
    
    def close(self):
        try:
            self.serial.close()
            print("Serial port closed")
        except:
            print("Error: serial already closed or not available")
    
    def readline(self):
        if not self.is_fake:
            if self.serial.is_open:
                while self.serial.inWaiting():
                    line = self.serial.readline()
                    return line.decode(encoding='UTF-8')
        else:
            if not self.echo == "":
                echo = "ok"         # sends "ok" as ack otherwise the feeder will stop sending buffered commands
                self.echo = ""
                return echo
        return None

class LimitedSizeDict(OrderedDict):
    def __init__(self, *args, **kwds):
        self.size_limit = kwds.pop("size_limit", None)
        OrderedDict.__init__(self, *args, **kwds)
        self._check_size_limit()

    def __setitem__(self, key, value):
        OrderedDict.__setitem__(self, key, value)
        self._check_size_limit()

    def _check_size_limit(self):
        if self.size_limit is not None:
            while len(self) > self.size_limit:
                self.popitem(last=False)

# this thread calls a function after a timeout but only if the "update" method is not called before that timeout expires
class BufferTimeout(Thread):
    def __init__(self, timeout_delta, function, group=None, target=None, name=None, args=(), kwargs=None):
        super(BufferTimeout, self).__init__(group=group, target=target, name=name)
        self.timeout_delta = timeout_delta
        self.callback = function
        self.mutex = Lock()
        self.is_running = False
        self.setDaemon(True)
        self.update()

    def update(self):
        with self.mutex:
            self.timeout_time = time.time() + self.timeout_delta

    def stop(self):
        with self.mutex:
            self.is_running = False

    def run(self):
        self.is_running = True
        while self.is_running:
            with self.mutex:
                timeout = self.timeout_time
            current_time = time.time()
            if current_time > timeout:
                self.callback()
                self.update()
                with self.mutex:
                    timeout = self.timeout_time
            time.sleep(timeout - current_time)
