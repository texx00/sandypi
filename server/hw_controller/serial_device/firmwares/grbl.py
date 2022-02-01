from threading import Thread
from time import time
from server.hw_controller.serial_device.device_serial import DeviceSerial
from server.hw_controller.serial_device.firmwares.firmware_event_handler import FirwmareEventHandler
from server.hw_controller.serial_device.firmwares.generic_firmware import GenericFirmware
from server.utils import settings_utils


class Grbl(GenericFirmware):
    """
    Handle the comunication with devices running Grbl
    """

    def __init__(self, serial_settings, logger, event_handler: FirwmareEventHandler):
        super().__init__(serial_settings, logger, event_handler)
        self._logger.info("Setting up coms with a Grbl device")
        # command used to update the buffer status or get a free ack
        self.force_ack_command = "?"

    def emergency_stop(self):
        """
        Stop the device immediately
        """
        self.send_gcode_command("!")

    def _on_readline(self, line):
        """
        Parse the line received from the device

        Args:
            line: line to be parsed, received from the device usually

        Returns:
            True if the line is handled correctly
        """
        with self._mutex:
            # if the line is not valid will return False
            if not super()._on_readline(line):
                return False

            hide_line = False
            if line.startswith("<"):
                try:
                    # interested in the "Bf:xx," part where xx is the content of the buffer
                    # select buffer content lines
                    res = line.split("Bf:")[1]
                    res = int(res.split(",")[0])
                    if (
                        res == 15
                    ):  # 15 => buffer is empty on the device (should include also 14 to make it more flexible?)
                        self.buffer.clear()
                    if res != 0:  # 0 -> buffer is full
                        if len(self.buffer) > 0:
                            self.buffer.popleft()
                            hide_line = True
                    self.buffer.check_buffer_mutex_status()

                    self._logger.log(settings_utils.LINE_SERVICE, line)
                except:  # sometimes may not receive the entire line thus it may throw an error
                    pass  # FIXME
                return False
            # if the device is connected and ready will send a "Grbl" line
            elif "Grbl" in line:
                self._on_device_ready()

            # errors
            elif "error:22" in line:
                self.buffer.clear()
                self._logger.error("Grbl error: {}".format(line))
            elif "error:" in line:
                self._logger.error("Grbl error: {}".format(line))
                # TODO check/parse error types and give some hint about the problem?

            self._log_received_line(line, hide_line)
        return True

    def _on_device_ready(self):
        """
        Run some commands when the device is ready
        """
        # grbl status report mask setup
        # sandypi need to check the buffer to see if the machine has cleaned the buffer
        # setup grbl to show the buffer status with the $10 command
        #   Grbl 1.1 https://github.com/gnea/grbl/wiki/Grbl-v1.1-Configuration
        #   Grbl 0.9 https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.9
        # to be compatible with both will send $10=6 (4(for v0.9) + 2(for v1.1))
        # the status will then be prompted with the "?" command when necessary
        # the buffer will contain Bf:"usage of the buffer"
        with self._mutex:
            self.send_gcode_command("$10=6")
            super()._on_device_ready()
