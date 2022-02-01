"""
Test firmware comunication control classes
"""

import logging
from time import time

import pytest
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


def run_test(device):

    device.connect()
    device.send_gcode_command("G28")
    device.send_gcode_command("G0 X0 Y0 F300")
    for x in range(15):
        device.send_gcode_command(f"G0 X{x*2} Y0")
    print("Done")
    time.sleep(10)
    assert len(device.buffer) == 0


# setting up a maximum expected time of execution for this test
def test_marlin():
    pass
    # run_test(Marlin(serial_settings=settings, logger=logger_name, event_handler=EventHandler()))


# setting up a maximum expected time of execution for this test
def test_grbl():
    pass
    # run_test(Grbl(serial_settings=settings, logger=logger_name, event_handler=EventHandler()))
