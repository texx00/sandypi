from enum import auto
from threading import Thread, Lock
import serial.tools.list_ports
import serial
import time
import traceback
import sys
import logging
from server.hw_controller.emulator import Emulator
import glob

# This class connects to a serial device
# If the serial device request is not available it will create a virtual serial device

class DeviceSerial():
    def __init__(self, serialname = None, baudrate = 115200, logger_name = None, autostart = False):
        self.logger = logging.getLogger(logger_name) if not logger_name is None else logging.getLogger()
        self.serialname = serialname
        self.baudrate = baudrate
        self.is_fake = False
        self._buffer = bytearray()
        self.echo = ""
        self._emulator = Emulator()

        # opening serial
        try:
            args = dict(
                baudrate = self.baudrate,
                timeout = 0,
                write_timeout = 0
            )
            self.serial = serial.Serial(**args)
            self.serial.port = self.serialname
            self.serial.open()
            self.logger.info("Serial device connected")
        except Exception as e:
            self.logger.exception(e)
            # TODO should add a check to see if the problem is that cannot use the Serial module because it is not installed correctly on raspberry
            self.is_fake = True
            self.logger.error("Serial not available. Are you sure the device is connected and is not in use by other softwares? (Will use the fake serial)")
        
        # empty callback function
        def useless(arg):
            pass

        # setting up the read thread
        self._th = Thread(target=self._thf, daemon=True)
        self._mutex = Lock()
        self._th.name = "serial_read"
        self._running = False
        self.set_onreadline_callback(useless)
        if autostart:
            self.start_reading()
    

    # starts the reading thread
    def start_reading(self):
        self._th.start()

    # this method is used to set a callback for the "new line available" event
    def set_onreadline_callback(self, callback):
        self._on_readline = callback
    
    # check if the reading thread is working
    def is_running(self):
        return self._running
    
    # stops the serial read thread
    def stop(self):
        self._running = False

    # sends a line to the device
    def send(self, obj):
        if self.is_fake:
            self._emulator.send(obj)
        else:
            if self.serial.is_open:
                try:
                    with self._mutex:
                        while self.serial.out_waiting:
                            pass            # TODO should add a sort of timeout
                        self._readline()
                        self.serial.write(str(obj).encode())
                        # TODO try to send byte by byte instead of a full line? (to reduce the risk of sending commands with missing digits or wrong values that may lead to a wrong position value)
                except:
                    self.close()
                    self.logger.error("Error while sending a command")
    
    # return a list of available serial ports
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

    # check if is connected to a real device
    def is_connected(self):
        if(self.is_fake):
            return False
        return self.serial.is_open
    
    # close the connection with the serial device
    def close(self):
        self.stop()
        try:
            self.serial.close()
            self.logger.info("Serial port closed")
        except:
            self.logger.error("Error: serial already closed or not available")
    
    # private functions

    # reads a line from the device
    def _readline(self):
        if not self.is_fake:
            if self.serial.is_open:
                while self.serial.in_waiting>0:
                    line = self.serial.readline()
                    return line.decode(encoding="UTF-8")
        else:
            return self._emulator.readline()

    # thread function
    def _thf(self):
        self._running = True
        next_line = ""
        while(self.is_running()):
            with self._mutex:
                next_line = self._readline()
            # cannot use the callback inside the mutex otherwise may run into a deadlock with the mutex if the serial.send is called in the parsing method
            self._on_readline(next_line)