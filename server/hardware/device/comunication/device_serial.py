from threading import Thread, RLock
from time import sleep
import serial.tools.list_ports
import serial
import sys
import logging
import glob

from server.hardware.device.comunication.emulator import Emulator


class DeviceSerial:
    """
    Connect to a serial device
    If the serial device request is not available it will create a virtual serial device
    """

    def __init__(self, serial_name=None, baudrate=115200, logger_name=None):
        """
        Args:
            serial_name: name of the serial port to use
            baudrate: baudrate value to use
            logger_name: name of the logger to use
        """
        self.logger = (
            logging.getLogger(logger_name) if not logger_name is None else logging.getLogger()
        )
        self.serialname = serial_name
        self.baudrate = baudrate
        self.is_virtual = False
        self.serial = None
        self._buffer = bytearray()
        self.echo = ""
        self._emulator = Emulator()

        # empty callback function
        def useless(arg):
            pass

        # setting up the read thread
        self._th = Thread(target=self._thf, daemon=True)
        self._mutex = RLock()
        self._th.name = "serial_read"
        self._running = False
        self.set_on_readline_callback(useless)

    def open(self):
        """
        Open the serial port

        If the port is not working, work as a virtual device
        """
        try:
            args = dict(baudrate=self.baudrate, timeout=0, write_timeout=0)
            self.serial = serial.Serial(**args)
            self.serial.port = self.serialname
            self.serial.open()
            self.logger.info("Serial device connected")
        except Exception as e:
            # FIXME should check for different exceptions
            self.logger.exception(e)
            self.is_virtual = True
            self.logger.error(
                "Serial not available. Are you sure the device is connected and is not in use by other softwares? (Will use the virtual serial)"
            )

        self._th.start()

    def set_on_readline_callback(self, callback):
        """
        Set the a callback for a new line received

        Args:
            callback: the function to call when a new line is received. The function will receive the line as an argument
        """
        self._on_readline = callback

    @property
    def is_running(self):
        """
        Check if the reading thread is running

        Returns:
            True if the readline thread is running
        """
        return self._running

    def stop(self):
        """
        Stop the serial read thread
        """
        self._running = False

    def send(self, line):
        """
        Send a line to the device

        Args:
            line: the line to send to the device
        """
        if self.is_virtual:
            self._emulator.send(line)
        else:
            if self.serial.is_open:
                try:
                    with self._mutex:
                        while self.serial.out_waiting:
                            pass  # TODO should add a sort of timeout
                        self._readline()
                        self.serial.write(str(line).encode())
                        # TODO try to send byte by byte instead of a full line? (to reduce the risk of sending commands with missing digits or wrong values that may lead to a wrong position value)
                except:
                    self.close()
                    self.logger.error("Error while sending a command")

    @property
    def is_connected(self):
        """
        Returns:
            True if the serial is open on a real device
        """
        if self.is_virtual:
            return False
        return self.serial.is_open

    def close(self):
        """
        Close the connection with the serial device
        """
        self.stop()
        try:
            self.serial.close()
            self.logger.info("Serial port closed")
        except:
            self.logger.error("Error: serial already closed or not available")

    # private functions

    def _readline(self):
        """
        Reads a line from the device (if available) and call the callback
        """
        if not self.is_virtual:
            if self.serial.is_open:
                while self.serial.in_waiting > 0:
                    line = self.serial.readline()
                    return line.decode(encoding="UTF-8")
        else:
            return self._emulator.readline()

    def _thf(self):
        """
        Thread function for the readline
        """
        self._running = True
        next_line = ""
        buff = ""

        while self.is_running:
            # do not understand why but with the emulator need this to make everything work correctly
            with self._mutex:
                buff = self._readline()

            # reconstruct line from the partial string received
            if not buff is None:
                next_line += buff
            res = next_line.split("\n") if not next_line is None else []
            if len(res) > 1:
                # cannot use the callback inside the mutex otherwise may run into a deadlock with the mutex if the serial.send is called in the parsing method
                next_line = res[-1]
                for l in res[:-1]:
                    self._on_readline(l)

    @classmethod
    def get_serial_port_list(cls):
        """
        Returns:
            list of the names of the available serial ports
        """
        if sys.platform.startswith("win"):
            plist = serial.tools.list_ports.comports()
            ports = [port.device for port in plist]
        elif sys.platform.startswith("linux") or sys.platform.startswith("cygwin"):
            # this excludes your current terminal "/dev/tty"
            ports = glob.glob("/dev/tty[A-Za-z]*")
        else:
            raise EnvironmentError("Unsupported platform")
        return ports
