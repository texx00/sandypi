from threading import Thread, Lock
import os
import sys
import glob
from pathlib import Path
from gcode_rescalers import *
import time
import serial.tools.list_ports
import serial
import atexit
import traceback
import json
from utils import settings_utils

class FeederEventHandler():
    # called when the drawing is finished
    def on_drawing_ended(self):
        pass

    # called when a new drawing is started
    def on_drawing_started(self):
        pass
    
    # called when the feeder receives a message that must be sent to the frontend
    def on_message_received(self, line):
        pass


class Feeder():
    def __init__(self, handler = None):
        self._isrunning = False
        self._ispaused = False
        self.total_commands_number = None
        self.command_number = 0
        self._th = None
        self.mutex = Lock()
        if handler is None:
            self.handler = FeederEventHandler()
        else: self.handler = handler
        self.serial = None
        self.line_number = 0
    
    def close(self):
        self.serial.close()

    def connect(self):
        print("Connecting to serial device...")
        settings = settings_utils.load_settings()
        with self.mutex:
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

        # reset line number when connecting
        self.line_number = 0
        self.send_gcode_command("M110 N1")  
        # send the "on connection" script from the settings
        self.send_script(settings['scripts']['connection'])

    def set_event_handler(self, handler):
        self.handler = handler

    # starts to send gcode to the machine
    def start_code(self, code, force_stop=False):
        if(not force_stop and self.is_running()):
            return False    # if a file is already being sent it will not start a new one
        else:
            if self.is_running():
                self.stop()
            with self.mutex:
                self._th = Thread(target = self._thf, args=(code,), daemon=True)
                self._isrunning = True
                self._ispaused = False
                self._running_code = code
                self.command_number = 0
                self._th.start()
            self.handler.on_drawing_started()

    # ask if the feeder is already sending a file
    def is_running(self):
        with self.mutex:
            return self._isrunning

    # ask if the feeder is paused
    def is_paused(self):
        with self.mutex:
            return self._ispaused

    # return the code of the drawing on the go
    def get_drawing_code(self):
        with self.mutex:
            return self._running_code
    
    # stops the drawing
    def stop(self):
        if(self.is_running()):
            with self.mutex:
                self._isrunning = False
    
    # pause the drawing
    # can resume with "resume()"
    def pause(self):
        with self.mutex:
            self._ispaused = True
    
    # resume the drawing (only if used with "pause()" and not "stop()")
    def resume(self):
        with self.mutex:
            self._ispaused = False

    # thread function
    def _thf(self, code):
        settings = settings_utils.load_settings()
        self.send_script(settings['scripts']['before'])

        print("Starting new drawing with code {}".format(code))
        with self.mutex:
            code = self._running_code
        filename = os.path.join(Path(__file__).parent.parent.absolute(), "UIserver/static/Drawings/{0}/{0}.gcode".format(code))
        
        # TODO retrieve saved information for the gcode filter
        dims = {"table_x":100, "table_y":100, "drawing_max_x":100, "drawing_max_y":100, "drawing_min_x":0, "drawing_min_y":0}
        # TODO calculate an estimate about the remaining time for the current drawing (for the moment can output the number of rows over the total number of lines in the file)
        self.total_commands_number = 10**6  # TODO change this placeholder

        filter = Fit(dims)
        
        with open(filename, "r") as file:
            file_line = 1
            for k, line in enumerate(file):
                if not self.is_running():
                    break
                while self.is_paused():
                    time.sleep(1)
                if not line[0]==";":
                    # TODO parse line to scale/add padding to the drawing according to the drawing settings (in order to keep the original .gcode file)
                    #line = filter.parse_line(line)
                    #line = "N{} ".format(file_line) + line
                    time.sleep(0.1)

                    self.send_gcode_command(line)
        self.send_script(settings['scripts']['after'])
        self.handler.on_drawing_ended()

    # thread that keep reading the serial port
    def _thsr(self):
        while True:
            with self.mutex:
                try:
                    line = self.serial.readline()
                except:
                    print("Serial connection lost")
            if not line is None:
                line = line.decode("utf-8") 
                self.parse_device_line(line)

    # parse a line coming from the device
    def parse_device_line(self, line):
        print(line) # TODO parse the line properly to save information coming from the device or to send back missing lines/allow for new line to be sent when the buffer is not full anymore
        self.handler.on_message_received(line)

    def get_status(self):
        with self.mutex:
            return {"is_running":self._isrunning, "progress":[self.command_number, self.total_commands_number], "is_paused":self._ispaused, "is_connected":self.serial.is_connected()}

    def send_gcode_command(self, command):
        # some commands require to update the feeder status
        # parse the command if necessary
        if "M110" in command:
            cs = command.split(" ")
            for c in cs:
                if c[0]=="N":
                    self.line_number = int(c[1:]) -1

        # send the command after parsing the content
        with self.mutex:
            self.line_number = self.line_number + 1
            line = "N{} {} ".format(self.line_number, command)
            # calculate checksum according to the wiki
            cs = 0
            for i in line:
                cs = cs ^ ord(i)
            cs &= 0xff
            
            line +="*{}\n".format(cs)   # add checksum to the line
            self.serial.send(line)      # send line

    # Send a multiline script
    def send_script(self, script):
        print("Sending script: ")
        script = script.split("\n")
        for s in script:
            print("> " + s)
            self.send_gcode_command(s)

class DeviceSerial():
    def __init__(self, serialname = None, baudrate = None):
        self.serialname = serialname
        self.baudrate = baudrate
        self.is_fake = False
        self.echo = ""
        try:
            self.serial = serial.Serial()
            self.serial.port = self.serialname
            self.serial.baudrate = self.baudrate
            self.serial.open()
            print("Serial device connected")
        except:
            print(traceback.print_exc())
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
                    self.serial.write(str(obj).encode())
                except:
                    self.close()
                    print("Error while sending a command")
    
    # TODO add a serial read thread

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
                if self.serial.inWaiting():
                    return self.serial.readline()
        else:
            if not self.echo == "":
                echo = self.echo
                self.echo = ""
                return echo.encode()
        return None


# tests
if __name__ == "__main__":
    fed = Feeder()

    fed.start_code(10)
