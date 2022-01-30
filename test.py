# FIXME remove this

import time
from server.hw_controller.serial_device.firmwares.marlin import Marlin
from server.hw_controller.serial_device.firmwares.firmware_event_handler import FirwmareEventHandler
import logging

if __name__ == "__main__":

    class EventHandler(FirwmareEventHandler):
        def on_line_received(self, line):
            print(f"Line received: {line}")

        def on_line_sent(self, line):
            print(f"Line sent: {line}")

    device = Marlin(
        serial_settings={"serial_name": "COM3", "baudrate": 115200},
        logger=logging.getLogger().name,
        event_handler=EventHandler(),
    )
    device.connect()
    device.send_gcode_command("G28")
    device.send_gcode_command("G0 X0 Y0 F300")
    for x in range(15):
        device.send_gcode_command(f"G0 X{x}00 Y0")
        time.sleep(0.01)
    time.sleep(10)

    print("Done")

    while True:
        pass
