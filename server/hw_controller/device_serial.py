import serial.tools.list_ports
import serial
import time
import sys
import logging
from server.hw_controller.emulator import Emulator

# This class connect to a serial device
# If the serial device request is not available it will create a virtual serial device


class DeviceSerial():
    def __init__(self, serialname = None, baudrate = None, logger_name = None):
        self.logger = logging.getLogger(logger_name) if not logger_name is None else logging.getLogger()
        self.serialname = serialname
        self.baudrate = baudrate
        self.is_fake = False
        self._buffer = bytearray()
        self.echo = ""
        self._emulator = Emulator()

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
        except:
            #print(traceback.print_exc())
            # TODO should add a check to see if the problem is that cannot use the Serial module because it is not installed correctly on raspberry
            self.is_fake = True
            self.logger.error("Serial not available. Will use the fake serial")

    def send(self, obj):
        if self.is_fake:
            self._emulator.send(obj)
        else:
            if self.serial.is_open:
                try:
                    while self.readline():
                        pass
                    self.serial.write(str(obj).encode())
                except:
                    self.close()
                    self.logger.error("Error while sending a command")
    
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
            self.logger.info("Serial port closed")
        except:
            self.logger.error("Error: serial already closed or not available")
    
    def readline(self):
        if not self.is_fake:
            if self.serial.is_open:
                while self.serial.inWaiting():
                    line = self.serial.readline()
                    return line.decode(encoding='UTF-8')
        else:
            return self._emulator.readline()
        return None
