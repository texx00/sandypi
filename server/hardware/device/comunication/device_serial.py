from queue import Queue
import sys
import logging
import glob
from threading import Thread, RLock
from time import sleep
import serial
import serial.tools.list_ports

from server.hardware.device.comunication.emulator import Emulator
from server.hardware.device.comunication.readline_buffer import ReadlineBuffer

# loops in this class need a short sleep otherwise the entire app get stuck for some reason
LOOPS_SLEEP_TIME = 0.001


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
        self._emulator = Emulator()
        self._readline_buffer = ReadlineBuffer()

        # empty callback function
        def useless(arg):
            pass

        # setting up the read thread
        self._mutex = RLock()
        self._th = Thread(target=self._thf, daemon=True)
        self._th.name = "serial_read"
        self._running = False

        # setting up callbacks (they are called in a separate thread to have non blocking serial handling)
        self._callbacks_queue = Queue()
        self.set_on_readline_callback(useless)
        self._callbacks_th = Thread(target=self._use_callbacks, daemon=True)
        self._callbacks_th.name = "serial_callbacks"

    def open(self):
        """
        Open the serial port

        If the port is not working, work as a virtual device
        """
        try:
            if self.serialname in self.get_serial_port_list():
                args = dict(baudrate=self.baudrate, timeout=0, write_timeout=0)
                self.serial = serial.Serial(**args)
                self.serial.port = self.serialname
                self.serial.open()
                self.logger.info("Serial device connected")
            else:
                self.is_virtual = True
                self.logger.error(
                    "The selected serial port is not available. Starting a virtual device..."
                )
        except Exception as e:
            # FIXME should check for different exceptions
            self.logger.exception(e)
            self.is_virtual = True
            self.logger.error(
                "Serial not available. Are you sure the device is connected and is not in use by other softwares? "
                + "(Will use the virtual serial)"
            )

        self._th.start()

    def set_on_readline_callback(self, callback):
        """
        Set the a callback for a new line received

        Args:
            callback: the function to call when a new line is received.
                The function will receive the line as an argument
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
                    # wait for the serial to be clear before sending to reduce the possibility of a collision
                    while self.serial.out_waiting > 0 or (self.serial.in_waiting > 0):
                        sleep(LOOPS_SLEEP_TIME)
                    with self._mutex:
                        self.serial.write(str(line).encode())
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
        line = ""
        if not self.is_virtual:
            if self.serial.is_open:
                if self.serial.in_waiting > 0:
                    line = self.serial.readline()
                    line = line.decode(encoding="UTF-8")
        else:
            line = self._emulator.readline()

        if (line == "") or (line is None):
            return

        self._readline_buffer.update_buffer(line)

    def _thf(self):
        """
        Thread function for the readline
        """
        self._running = True

        self._callbacks_th.start()

        while self.is_running:
            # do not understand why but with the emulator need this to make everything work correctly
            with self._mutex:
                self._readline()

            # check if should use the callback when there is a new full line
            full_lines = self._readline_buffer.full_lines
            # use the callback for every full line available
            for full_line in full_lines:
                self._callbacks_queue.put(full_line)

    def _use_callbacks(self):
        """
        Run the callback when a line is received

        Keep the operation asynchronous to avoid deadlocks with the "send" command
        """
        while self._running:
            sleep(LOOPS_SLEEP_TIME)
            if not self._callbacks_queue.empty():
                full_line = self._callbacks_queue.get()
                try:
                    self._on_readline(full_line)
                except Exception as exception:
                    self.logger.error(
                        f"Exception while raising the readline callback on line '{full_line}'"
                    )
                    self.logger.exception(exception)

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
