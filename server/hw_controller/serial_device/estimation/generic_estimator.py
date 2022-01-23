import re
from dotmap import DotMap

# List of commands that can be parsed by the estimator
KNOWN_COMMANDS = ("G0", "G00", "G1", "G01", "G28", "G92")

# TODO change this class to work in a different way
# every command should be represented by a function
# if the function is available will call the corresponding function in order to estimate the real trajectory/position

# TODO should add realtime estimation in the "get_current_position" method instead of returning the one from the last command


class GenericEstimator:
    """
    Keep track of the current position and extimate the time elapsed or the length of the path done
    """

    def __init__(self):

        self._position = DotMap({"x": 0, "y": 0})
        self._feedrate = 0
        self._path_length = 0

        # regex generation for the parser
        self._feed_regex = re.compile(
            "[F]([0-9.-]+)($|\s)"
        )  # looks for a +/- float number after an F, until the first space or the end of the line
        self._x_regex = re.compile(
            "[X]([0-9.-]+)($|\s)"
        )  # looks for a +/- float number after an X, until the first space or the end of the line
        self._y_regex = re.compile(
            "[Y]([0-9.-]+)($|\s)"
        )  # looks for a +/- float number after an Y, until the first space or the end of the line

    @property
    def position(self):
        """
        Returns:
            estimated position of the device
        """
        return self._position

    @position.setter
    def position(self, pos):
        """
        Set the position

        Args:
            pos (dict): dict which must contain x and y coordinates
        """
        if not (hasattr(pos, "x") and hasattr(pos, "y")):
            raise ValueError("The position given must have both the x and y coordinates")
        self._position = DotMap(pos)

    def get_last_commanded_position(self):
        """
        Returns:
            dict: last commanded x,y position
        """
        # TODO this will change once the estimation is done properly
        return self._position

    def reset_path_length(self):
        self._path_length = 0

    def parse_command(self, command):
        """
        Parse buffer commands to get the position commanded or to reset position if is using G28/G92
        """
        # handling homing commands
        if "G28" in command and (not "X" in command or "Y" in command):
            self._position.x = 0
            self._position.y = 0
        # G92 is handled in the buffered commands

        if any(code in command for code in KNOWN_COMMANDS):
            if "F" in command:
                self.feedrate = float(self._feed_regex.findall(command)[0][0])
            if "X" in command:
                self._position.x = float(self._x_regex.findall(command)[0][0])
            if "Y" in command:
                self._position.y = float(self._y_regex.findall(command)[0][0])
