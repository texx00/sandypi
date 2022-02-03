# FIXME remove this

import time
from server.hardware.device.firmwares.grbl import Grbl
from server.hardware.device.firmwares.marlin import Marlin
from server.hardware.device.firmwares.firmware_event_handler import FirwmareEventHandler
import logging

if __name__ == "__main__":

    def test_device(device):
        device.connect()
        device.send_gcode_command("G28")
        device.send_gcode_command("G0 X0 Y0 F300")
        for x in range(15):
            device.send_gcode_command(f"G0 X{x*2} Y0")

    class EventHandler(FirwmareEventHandler):
        def on_line_received(self, line):
            print(f"Line received: {line}")

        def on_line_sent(self, line):
            print(f"Line sent: {line}")

        def on_device_ready(self):
            print("Device ready")

    settings = {"port": {"value": "COM3"}, "baud": {"value": 115200}}
    print("Testing Marlin")

    logger_name = logging.getLogger().name
    device = Marlin(
        serial_settings=settings,
        logger=logger_name,
        event_handler=EventHandler(),
    )

    test_device(device)

    print("Marlin done")

    print("Testing grbl")

    device = Grbl(serial_settings=settings, logger=logger_name, event_handler=EventHandler())

    # test_device(device)

    print("Grbl done")
