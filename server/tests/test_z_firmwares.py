"""
Test firmware comunication control classes
"""

import logging

from server.hw_controller.serial_device.firmwares.grbl import Grbl
from server.hw_controller.serial_device.firmwares.marlin import Marlin
from server.hw_controller.serial_device.firmwares.firmware_event_handler import FirwmareEventHandler


class EventHandler(FirwmareEventHandler):
    def on_line_received(self, line):
        pass

    def on_line_sent(self, line):
        pass

    def on_device_ready(self):
        print("Device ready")


settings = {"serial_name": "COM3", "baudrate": 115200}

logger_name = logging.getLogger().name


def run_test(device, fast_mode=False):
    device.connect()
    device.fast_mode = fast_mode
    device.send_gcode_command("G28")
    device.send_gcode_command("G0 X0 Y0 F3000")
    for x in range(15):
        device.send_gcode_command(f"G0 X{x} Y0")
    return True


def test_marlin():
    """
    Test Marlin firmware manager
    """
    assert run_test(
        Marlin(serial_settings=settings, logger=logger_name, event_handler=EventHandler())
    )

    assert run_test(
        Marlin(serial_settings=settings, logger=logger_name, event_handler=EventHandler()),
        fast_mode=True,
    )


def test_grbl():
    """
    Test Grbl firmware manager
    """
    assert run_test(
        Grbl(serial_settings=settings, logger=logger_name, event_handler=EventHandler())
    )
    assert run_test(
        Grbl(serial_settings=settings, logger=logger_name, event_handler=EventHandler()),
        fast_mode=True,
    )
