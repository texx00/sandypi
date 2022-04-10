import time
import re
import math
from collections import deque

from server.utils.settings_utils import load_settings

emulated_commands_with_delay = ["G0", "G00", "G1", "G01"]

ACK = "ok\n"


class Emulator:
    """Emulates a device"""

    def __init__(self):
        self.feedrate = 5000.0
        self.ack_buffer = deque()  # used for the standard "ok" acks timing
        self.message_buffer = deque()  # used to emulate marlin response to special commands
        self.last_time = time.time()
        self.xr = re.compile("[X]([0-9.]+)($|\s|)")
        self.yr = re.compile("[Y]([0-9.]+)($|\s|)")
        self.fr = re.compile("[F]([0-9.]+)($|\s|)")
        self.last_x = 0.0
        self.last_y = 0.0
        self.settings = load_settings()

    def get_x(self, line):
        """
        Return the x value of the command if available in the given line
        """
        return float(self.xr.findall(line)[0][0])

    def get_y(self, line):
        """
        Return the y value of the command if available in the given line
        """
        return float(self.yr.findall(line)[0][0])

    def _buffer_empty(self):
        """Return True if the buffer is empty"""
        return len(self.ack_buffer) < 1

    def send(self, command):
        """
        Used to send a command to the emulator

        Args:
            - command: the command sent to the emulator
        """

        if self._buffer_empty():
            self.last_time = time.time()

        # TODO introduce the response for particular commands (like feedrate request, position request and others)

        # reset position for G28 command
        if "G28" in command:
            self.last_x = 0.0
            self.last_y = 0.0
            self.message_buffer.append(ACK)

        # when receives a line calculate the time between the line received and when the ack must be sent back with the feedrate
        if any(code in command for code in emulated_commands_with_delay):
            # check if should update feedrate
            f = self.fr.findall(command)
            if len(f) > 0:
                self.feedrate = float(f[0][0])

            # get points coords
            try:
                x = self.get_x(command)
            except:
                x = self.last_x
            try:
                y = self.get_y(command)
            except:
                y = self.last_y
            # calculate time
            self.feedrate = max(self.feedrate, 0.01)
            t = max(
                math.sqrt((x - self.last_x) ** 2 + (y - self.last_y) ** 2) / self.feedrate * 60.0,
                0.1,
            )  # TODO need to use the max 0.005 because cannot simulate anything on the frontend otherwise... May look for a better solution

            # update positions
            self.last_x = x
            self.last_y = y

            # add calculated time
            self.last_time += t
            self.ack_buffer.append(self.last_time)

        else:
            self.message_buffer.append(ACK)

    def readline(self):
        """
        Readline method for the emulated device. Used by the serial controller
        """
        # this time is needed to slow down the loop otherwise the software get stuck with the emulator
        time.sleep(0.001)
        # special commands response
        if len(self.message_buffer) >= 1:
            return self.message_buffer.popleft()

        # standard lines acks (G0, G1)
        if self._buffer_empty():
            return None
        oldest = 1000000000
        if len(self.ack_buffer):
            oldest = self.ack_buffer.popleft()
        if oldest > time.time():
            self.ack_buffer.appendleft(oldest)
            return None
        return ACK
