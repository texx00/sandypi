from threading import Thread
import time

from server.hw_controller.serial_device.device_serial import DeviceSerial
from server.hw_controller.serial_device.firmwares.generic_firmware import GenericFirmware


class Marlin(GenericFirmware):
    """
    Handle devices running Marlin
    """

    def __init__(self, serial_settings, logger):
        super().__init__(serial_settings, logger)
        self._logger.info("Marlin device")
        self._command_resolution = "{:.1f}"
        # command used to update the buffer status or get a free ack
        self.buffer_command = "M114"

    def connect(self):
        """
        Start the connection procedure with the serial device
        """
        with self._mutex:
            self._logger.info("Connecting to the serial device")
            with self.serial_mutex:
                self._serial_device = DeviceSerial(
                    self._serial_settings["serial_name"],
                    self._serial_settings["baudrate"],
                    self._logger.name,
                )
                self._serial_device.set_onreadline_callback(self._on_readline)
                self._serial_device.open()
                # wait device ready
                if self._serial_device.is_fake:
                    self._is_ready = True
                else:
                    # runs a delay to wait the device to be ready
                    # TODO make this better: check messages from the device to understand when is ready
                    def delay():
                        time.sleep(5)
                        self._on_device_ready()

                    th = Thread(target=delay, daemon=True)
                    th.name = "waiting_device_ready"
                    th.start()

    def _on_readline(self, line):
        """
        Parse the line received from the device
            Args:
                line: line to be parse, received from the device usually
        """
        with self._mutex:
            pass

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
                    self.command_buffer.clear()

        # add checksum
        if n is None:
            n = self.line_number
        if self.fast_mode:
            line = "N{}{}".format(n, line)
        else:
            line = "N{} {} ".format(n, line)
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

    def _reset_line_number(self, line_number=2):
        """
        Send a gcode command to reset the line numbering on the device

        Args:
            line_number (optional): the line number that should start counting from
        """
        with self._mutex:
            self._logger.info("Resetting line number")
            self.send_gcode_command("M110 N{}".format(line_number))
