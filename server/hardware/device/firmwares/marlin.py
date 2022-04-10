from copy import deepcopy
from threading import Timer, Lock

from server.hardware.device.firmwares.firmware_event_handler import FirwmareEventHandler
from server.hardware.device.firmwares.generic_firmware import GenericFirmware


class Marlin(GenericFirmware):
    """
    Handle the comunication with devices running Marlin
    """

    def __init__(self, serial_settings, logger, event_handler: FirwmareEventHandler):
        super().__init__(serial_settings, logger, event_handler)
        self._logger.info("Setting up coms with a Marlin device")
        # marlin specific values
        self._command_resolution = "{:.1f}"
        # command used to update the buffer status or get a free ack
        self.force_ack_command = "M114"
        # tolerance position (needed because the marlin rounding for the actual position is not the usual rounding)
        self.position_tolerance = 0.01
        # this variable is used to keep track if is already resending commands or not
        self._resending_commands = Lock()

    def emergency_stop(self):
        """
        Stop the device immediately
        """
        self.send_gcode_command("M112")

    def reset_status(self):
        """
        To be called when a job is stopped/finished

        With Marlin, will also reset the line number

        """
        super().reset_status()
        self._reset_line_number()

    def _on_readline(self, line):
        """
        Parse the line received from the device

        Args:
            line: line to be parse, received from the device usually

        Returns:
            True if the line is handled correctly
        """
        # cannot use the mutex here because the callback is used inside the serial which is also used to read back the data
        # if the mutex is used, the send command will block the readline command which is prioritized

        # if the line is not valid will return False
        if not super()._on_readline(line):
            return False

        hide_line = False

        # Parsing the received command
        # Resend
        if ("Resend:" in line) or ("Error:checksum mismatch" in line):
            hide_line = self._resend(line)

        # M114 response contains the "Count" word
        # the response looks like: X:115.22 Y:116.38 Z:0.00 E:0.00 Count A:9218 B:9310 Z:0
        # still, M114 will receive the last position in the look-ahead planner thus the drawing will end first on the interface and then in the real device
        elif "Count" in line:
            hide_line = self._count(line)

        # the device send a "start" line when ready
        elif "start" in line:
            # adding delay otherwise there is a collision most of the time (n seconds)
            Timer(2, self._on_device_ready).start()

        # unknow command
        elif "echo:Unknown command:" in line:
            self._logger.error("Error: command not found. Can also be a communication error")
            # resend the last command sent
            self._serial_device.send(self.buffer.last)

        # TODO check feedrate response for M220 and set feedrate
        # elif "_______" in line: # must see the real output from marlin
        #    self.feedrate = .... # must see the real output from marlin

        self._log_received_line(line, hide_line)
        return True

    def _count(self, line):
        """
        Synchronize the estimated position with the real buffer position

        Args:
            line [str]: the line received from the device which should be using the correct format

        Returns:
            True if the line must be hidden in the printout of received commands
        """
        try:
            l = line.split(" ")
            x = float(l[0][2:])  # remove "X:" from the string
            y = float(l[1][2:])  # remove "Y:" from the string
        except Exception as e:
            self._logger.error("Error while parsing M114 result for line: {}".format(line))
            self._logger.exception(e)

        commanded_position = self.estimator.get_last_commanded_position()
        # if the last commanded position coincides with the current position it means the buffer on the device is empty (could happen that the position is the same between different points but the M114 command should not be that frequent to run into this problem.) TODO check if it is good enough or if should implement additional checks like a timeout
        # use a tolerance instead of equality because marlin is using strange rounding for the coordinates
        if (abs(float(commanded_position.x) - x) < self.position_tolerance) and (
            abs(float(commanded_position.y) - y) < self.position_tolerance
        ):
            if not self.buffer.is_empty():
                self.buffer.ack_received()
            else:
                self.buffer.clear()
                self.buffer.check_buffer_mutex_status()

        return not self.buffer.is_empty()

    def _resend(self, line):
        """
        Handle a resend command

        Args:
            line [str]: the line received with the error (should contain the line number to send back)

        Returns:
            True if the received line should be hidden in the printout of received commands
        """
        line_found = False
        # need to resend the commands outside the mutex of the feeder -> store the commands in a list and use a different thread to send them
        if not self._priority_mutex.locked():
            self._priority_mutex.acquire()
        line_number = int(line.replace("\r\n", "").split(" ")[-1])
        self._logger.info(f"Line not received correctly. Resending from N{line_number}")
        items = deepcopy(self.buffer._buffer_history)
        first_available_line = None
        for command_n, command in items.items():
            n_line_number = int(command_n.strip("N"))
            if n_line_number == line_number:
                line_found = True
            if n_line_number >= line_number:
                if first_available_line is None:
                    first_available_line = line_number
                # All the lines after the required one must be resent. Cannot break the loop now
                self._serial_device.send(command)

        if line_found:
            self.buffer.ack_received(safe_line_number=line_number - 1, append_left_extra=True)
        else:
            self._logger.error("No line was found for the number required. Restart numeration.")
            # will reset the buffer and restart the numeration
            self.reset_status()

        # if (not line_found) and not (first_available_line is None):
        #    for i in range(line_number, first_available_line):
        #        self._serial_device.send(self._generate_line(self.force_ack_command, n=i))

        return False

    def _generate_line(self, command, n=None):
        """
        Clean the command, substitute the macro values and add checksum

        Args:
            command: command to be generated
            n: line number to use

        Returns:
            the generated line with the checksum
        """
        line = super()._generate_line(command)
        line = line.replace("\n", "")

        # check if the command contain a "reset line number" (M110)
        if "M110" in command:
            cs = command.split(" ")
            for c in cs:
                if c[0] == "N":
                    self.line_number = int(c[1:]) - 1
                    self.buffer.clear()
                # to set the line number just need "Nn M110"
                # the correct N value will be added automatically during the command creation
                line = "M110"

        # add checksum
        if n is None:
            n = self.line_number
        if self.fast_mode:
            line = f"N{n}{line}"
        else:
            line = f"N{n} {line} "
        # calculate marlin checksum according to the wiki
        cs = 0
        for i in line:
            cs = cs ^ ord(i)
        cs &= 0xFF

        line += f"*{cs}\n"  # add checksum to the line
        return line

    def _on_device_ready(self):
        """
        Run some commands when the device is ready
        """
        with self._mutex:
            self._reset_line_number()
            super()._on_device_ready()

    def _reset_line_number(self, line_number=3):
        """
        Send a gcode command to reset the line numbering on the device

        Args:
            line_number (optional): the line number that should start counting from
        """
        with self._mutex:
            self._logger.info("Clearing buffer and resetting line number")
            self.buffer.clear()
            self.send_gcode_command(f"M110 N{line_number}")
