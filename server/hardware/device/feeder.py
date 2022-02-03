import logging
import os

from dotenv import load_dotenv
from dotmap import DotMap
from threading import RLock

from server.hardware.device.estimation.cartesian import Cartesian
from server.hardware.device.estimation.generic_estimator import GenericEstimator
from server.hardware.device.estimation.polar import Polar
from server.hardware.device.estimation.scara import Scara
from server.hardware.device.feeder_event_handler import FeederEventHandler
from server.hardware.device.firmwares.firmware_event_handler import FirwmareEventHandler
from server.hardware.device.firmwares.generic_firmware import GenericFirmware
from server.hardware.device.firmwares.grbl import Grbl
from server.hardware.device.firmwares.marlin import Marlin

from server.utils import settings_utils
from server.utils.logging_utils import formatter, MultiprocessRotatingFileHandler

# list of known firmwares
available_firmwares = DotMap({"Marlin": Marlin, "Grbl": Grbl, "Generic": GenericFirmware})

# list of known device types, for which an estimator has been built
available_estimators = DotMap(
    {"Cartesian": Cartesian, "Polar": Polar, "Scara": Scara, "Generic": GenericEstimator}
)


class Feeder(FirwmareEventHandler):
    """
    Feed the gcode to the device

    Handle single commands but also the preloaded scripts and complete drawings or elements
    """

    # FIXME remove the None default from the event handler
    def __init__(self, event_handler: FeederEventHandler = None):
        """
        Args:
            event_handler: handler for the events like drawing started, drawing ended and so on
        """
        # initialize logger
        self.init_logger()

        self.event_handler = event_handler
        self._mutex = RLock()

        self.init_device(settings_utils.load_settings())

    def init_logger(self):
        """
        Initialize the logger

        Initiate the stream logger for the command line but also the file logger for the rotating log files
        """
        self.logger = logging.getLogger(__name__)
        self.logger.handlers = []  # remove default handlers
        self.logger.propagate = False  # False -> avoid passing it to the parent logger
        logging.addLevelName(settings_utils.LINE_SENT, "LINE_SENT")
        logging.addLevelName(settings_utils.LINE_RECEIVED, "LINE_RECEIVED")
        logging.addLevelName(settings_utils.LINE_SERVICE, "LINE_SERVICE")

        # set logger to lowest level to make availables all the levels to the handlers
        # in this way can have different levels in the handlers
        self.logger.setLevel(settings_utils.LINE_SERVICE)

        # create file logging handler
        file_handler = MultiprocessRotatingFileHandler(
            "server/logs/feeder.log", maxBytes=200000, backupCount=5
        )
        # the file logs must use the lowest level available
        file_handler.setLevel(settings_utils.LINE_SERVICE)
        file_handler.setFormatter(formatter)
        # add handler to the logger
        self.logger.addHandler(file_handler)

        # load sterr (cmd line) logging level from environment variables
        load_dotenv()
        level = os.getenv("FEEDER_LEVEL")
        # check if the level has been set in the environment variables (should be done in the flask.env or .env files)
        if not level is None:
            level = int(level)
        else:
            level = 0  # lowest level by default

        # create stream handler (to show the log on the command line)
        stream_handler = logging.StreamHandler()
        stream_handler.setLevel(level)  # can use a different level with respect to the file handler
        stream_handler.setFormatter(formatter)
        # add handler to the logger
        self.logger.addHandler(stream_handler)

        # print the logger level on the command line
        settings_utils.print_level(level, __name__.split(".")[-1])

    def init_device(self, settings):
        """
        Init the serial device

        Initialize the firmware depending on the settings given as argument

        Args:
            settings: the settings dict
        """
        self.settings = settings
        firmware = settings["device"]["firmware"]["value"]
        # create the device based on the choosen firmware
        if not available_firmwares.has_key(firmware):
            firmware = "Generic"
        self._device = available_firmwares[firmware](
            settings["serial"], logger=self.logger.name, event_handler=self
        )

        # enable or disable fast mode for the device
        self._device.fast_mode = settings["serial"]["fast_mode"]["value"]

        # select the right estimator depending on the device type
        device_type = settings["device"]["type"]["value"]
        if available_estimators.has_key(device_type):
            self._device.estimator = available_estimators[device_type]()
        # try to connect to the serial device
        # if the device is not available will create a fake/virtual device
        self._device.connect()

    def get_status(self):
        return {"is_running": True, "is_paused": True}

    def stop(self):
        pass

    def resume(self):
        pass

    def send_gcode_command(self, command):
        with self._mutex:
            self._device.send_gcode_command(command)

    def send_script(self, script):
        """
        Send a series of commands (script)

        Args:
            script: a string containing "\n" separated gcode commands
        """
        with self._mutex:
            script = script.split("\n")
            for s in script:
                if s != "" and s != " ":
                    self.send_gcode_command(s)

    # event handler methods

    def on_line_sent(self, line):
        self.logger.log(settings_utils.LINE_SENT, line)

    def on_line_received(self, line):
        self.logger.log(settings_utils.LINE_RECEIVED, line)

    def on_device_ready(self):
        self.logger.info(f"\nDevice ready.\n{self._device}\n")
        self.send_script(self.settings["scripts"]["connected"]["value"])