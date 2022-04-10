import logging
import re

from threading import RLock, Lock
import time
from py_expression_eval import Parser
from server.hardware.device.comunication.device_serial import DeviceSerial

from server.hardware.device.estimation.generic_estimator import GenericEstimator
from server.hardware.device.firmwares.commands_buffer import CommandBuffer
from server.hardware.device.firmwares.firmware_event_handler import FirwmareEventHandler
from server.utils import buffered_timeout, settings_utils

# Defines the character used to define macros
MACRO_CHAR = "&"

# List of commands that are buffered by the controller
BUFFERED_COMMANDS = ("G0", "G00", "G1", "G01", "G2", "G02", "G3", "G03", "G28", "G92")


class GenericFirmware:
    """
    Abstract class for a firmware

    The implementer must handle the messages send to and received from the device
    """

    def __init__(self, serial_settings, logger, event_handler: FirwmareEventHandler):
        """
        Args:
            serial_settings: dict containing the serial settings
                Must have:
                    serial_name: name of the serial port (like COM3 or tty/USB0)
                    baudrate: serial baudrate
            logger: name of the logger to use for logging the communication
            event_handler: event handler for line sent and line received
        """

        if serial_settings is None:
            raise TypeError("The serial_device must not be None")
        self._serial_settings = serial_settings
        self._logger = logging.getLogger(logger) if not logger is None else logging.getLogger()
        self.event_handler = event_handler

        self._serial_device = None
        self._fast_mode = True  # by default fast_mode is enabled
        self.line_number = 0
        self._command_resolution = "{:.3f}"  # by default will use 3 decimals in fast mode
        self._mutex = RLock()
        # this mutex is used to send messages with a priority with respect to the standard commands
        # (like for the 'resend' command in marlin for which all the commands must be sent in a row)
        self._priority_mutex = Lock()
        self._is_ready = False  # the device will not be ready at the beginning
        self.estimator = GenericEstimator()

        # buffer control
        self._buffer = CommandBuffer(8)

        # timeout setup
        self.force_ack_command = ""  # command used to force an ack
        self.ack = "ok"  # the ack string sent from the device
        # timeout used to clear the buffer if some acks are lost
        self._timeout_last_line = 0
        self._timeout = buffered_timeout.BufferTimeout(30, self._on_timeout)
        self._timeout.start()

        # regex generation for the macro parser
        self.macro_regex = re.compile(
            MACRO_CHAR + "(.*?)" + MACRO_CHAR
        )  # looks for stuff between two "%" symbols. Used to parse macros

        self.macro_parser = Parser()  # macro expressions parser

    @property
    def fast_mode(self):
        """
        Returns:
            True if the device is using fast mode (GCODE is sent without blanks)
        """
        with self._mutex:
            return self._fast_mode

    @fast_mode.setter
    def fast_mode(self, mode):
        """
        Set fast mode

        Args:
            mode: True if fast mode must be used (blank spaces are removed from the gcode line)
        """
        with self._mutex:
            self._fast_mode = mode

    @property
    def feedrate(self):
        """
        Returns the current feedrate
        """
        with self._mutex:
            return self._feedrate

    @feedrate.setter
    def feedrate(self, feedrate):
        """
        Set the current feedrate
        """
        with self._mutex:
            self._feedrate = feedrate

    @property
    def buffer(self):
        """
        Returns:
            the buffer of commands sent to the device
        """
        with self._mutex:
            return self._buffer

    @property
    def is_ready(self):
        """
        Returns:
            True if the device can be used
            False if the device has not been initialized correctly yet
        """
        with self._mutex:
            return self._is_ready

    @property
    def is_connected(self):
        """
        Returns:
            True if the device is connected
        """
        return self._serial_device.is_connected

    def get_current_position(self):
        """
        Returns:
            coords: current x and y position in a dict
        """
        with self._mutex:
            return self.estimator.position

    def send_gcode_command(self, command, hide_command=False):
        """
        Send the command

        Args:
            command [str]: the command to send
            hide_command [bool]: True to hide the command from the list of sent commands in the UI
        """
        command = self._prepare_command(command)
        if command == "":
            return
        # wait until the lock for the buffer length is released
        # if the lock is released means the board sent the ack for older lines and can send new ones
        with self._buffer.get_buffer_wait_mutex():
            pass
        # if the priority mutex is locked should wait before sending the command until it is unlocked
        while self._priority_mutex.locked():
            ...

        # now can send the command
        with self._mutex:
            self._handle_send_command(command, hide_command)
            self.estimator.parse_command(command)
            self._update_timeout()  # update the timeout because a new command has been sent

    def connect(self):
        """
        Start the connection procedure with the serial device
        """
        with self._mutex:
            self._logger.info("Connecting to the serial device")
            self._serial_device = DeviceSerial(
                self._serial_settings["port"]["value"],
                self._serial_settings["baud"]["value"],
                self._logger.name,
            )
            self._serial_device.set_on_readline_callback(self._on_readline)
            self._serial_device.open()
            # wait device ready
            if not self._serial_device.is_connected:
                time.sleep(1)
                self._on_device_ready()

    def close(self):
        """
        Close the comunication with the device
        """
        with self._mutex:
            self._serial_device.close()

    def emergency_stop(self):
        """
        Stop the device immediately

        This method must be implemented in the child class
        """
        ...

    def reset_status(self):
        """
        Method that should be called when a job is stopped or finished

        Allow to reset the current status or variables and have a clean start for the next job
        """
        with self._mutex:
            self.line_number = 0

    def _parse_macro(self, command):
        """
        Parse a macro

        Macros are defined by the MACRO_CHAR.
        The method substitute the formula in the macro with the correct value
        """
        if not MACRO_CHAR in command:
            return command
        macros = self.macro_regex.findall(command)
        for m in macros:
            try:
                # see https://pypi.org/project/py-expression-eval/ for more info about the parser
                pos = self.estimator.get_last_commanded_position()
                res = self.macro_parser.parse(m).evaluate(
                    {"X": pos.x, "Y": pos.y, "F": self.estimator.feedrate}
                )
                command = command.replace(MACRO_CHAR + m + MACRO_CHAR, str(res))
            except Exception as exception:
                # TODO handle this in a better way
                self._logger.error("Error while parsing macro: " + m)
                self._logger.error(exception)
        return command

    def _prepare_command(self, command):
        """
        Clean and prepare the current command to be sent to the device

        Args:
            command: the gcode command to use

        Returns:
            a string with the cleaned command
        """
        with self._mutex:
            command = command.replace("\n", "").replace("\r", "").upper()
            return self._parse_macro(command)

    def _handle_send_command(self, command, hide_command=False):
        """
        Send the gcode command to the device and handle the buffer
        """
        with self._mutex:

            # send the command after parsing the content
            # need to use the mutex here because it is changing also the line number
            line = self._generate_line(command)

            self._serial_device.send(line)  # send line
            self._buffer.push_command(line, self.line_number)
            self._logger.log(settings_utils.LINE_SENT, line.replace("\n", ""))

            if not hide_command:
                self.event_handler.on_line_sent(line)  # uses the handler callback for the new line

    def _generate_line(self, command, n=None):
        """
        Handles the line before sending it
        """
        with self._mutex:
            line = command
            # if is using fast mode need to reduce numbers resolution and remove spaces

            if self.fast_mode:
                line = command.split(" ")
                new_line = []
                for l in line:
                    if l.startswith("X"):
                        l = "X" + self._command_resolution.format(float(l[1:])).rstrip("0").rstrip(
                            "."
                        )
                    elif l.startswith("Y"):
                        l = "Y" + self._command_resolution.format(float(l[1:])).rstrip("0").rstrip(
                            "."
                        )
                    new_line.append(l)
                line = "".join(new_line)
            line += "\n"

            self.line_number += 1
            return line

    def _on_timeout(self):
        """
        Callback for when the timeout is expired
        """
        with self._mutex:
            if (
                self._buffer.get_buffer_wait_mutex().locked
                and self.line_number == self._timeout_last_line
            ):
                # self.logger.warning("!Buffer timeout. Trying to clean the buffer!")
                # to clean the buffer try to send a buffer update message. In this way will trigger the buffer cleaning mechanism
                command = self.force_ack_command
                line = self._generate_line(command)
                self._logger.log(settings_utils.LINE_SERVICE, line)
                self._serial_device.send(line)
            else:
                self._update_timeout()

    def _update_timeout(self):
        """
        Update the timeout object in such a way that the interval is restored
        """
        self._timeout_last_line = self.line_number
        self._timeout.update()

    def _on_readline(self, line):
        """
        Parse a received line from the hw device

        Returns:
            True if the readline has done correctly
        """
        # with self._mutex:
        if line is None:
            return False
        if self.ack in line:
            self._buffer.ack_received()
        return True

    def _on_device_ready(self):
        """
        Called when the connected device is ready to receive commands
        """
        with self._mutex:
            self.event_handler.on_device_ready()
            self._is_ready = True

    def _log_received_line(self, line, hide_line=False):
        """
        Log the line received from the device
        Not called automatically in the _on_readline

        Args:
            line: the line received from the device
            hide_line: if True will not send the line to the frontend
        """
        line = line.rstrip("\r").rstrip("\n")
        self._logger.log(settings_utils.LINE_RECEIVED, line)
        if not hide_line:
            self.event_handler.on_line_received(line)

    def __str__(self) -> str:
        return f"Device:\n - firmware type: {type(self).__name__}\n - fast mode: {self.fast_mode}\n - {self.estimator}"
