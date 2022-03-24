import logging
import os
import time

from threading import RLock, Thread
from dotenv import load_dotenv
from dotmap import DotMap
from server.database.playlist_elements import DrawingElement, TimeElement

from server.hardware.device.estimation.cartesian import Cartesian
from server.hardware.device.estimation.generic_estimator import GenericEstimator
from server.hardware.device.estimation.polar import Polar
from server.hardware.device.estimation.scara import Scara
from server.hardware.device.feeder_event_handler import FeederEventHandler
from server.hardware.device.firmwares.firmware_event_handler import FirwmareEventHandler
from server.hardware.device.firmwares.generic_firmware import GenericFirmware
from server.hardware.device.firmwares.grbl import Grbl
from server.hardware.device.firmwares.marlin import Marlin

from server.database.generic_playlist_element import UNKNOWN_PROGRESS, GenericPlaylistElement

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
    def __init__(self, event_handler: FeederEventHandler):
        """
        Args:
            event_handler: handler for the events like drawing started, drawing ended and so on
        """
        # initialize logger
        self.init_logger()

        self.event_handler = event_handler
        self._mutex = RLock()
        self._device = None

        # feeder variables
        self._status = DotMap({"running": False, "paused": False, "progress": UNKNOWN_PROGRESS})
        self._current_element = None
        # self._stopped will be true when the device is correctly stopped after calling stop()
        self._stopped = False
        # thread instance running the elements
        self.__th = None

        # initialize the device
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
        with self._mutex:
            if self._status.running:
                self.stop()
        # close connection with previous settings if available
        if not self._device is None:
            if self._device.is_connected:
                self._device.close()

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

    @property
    def is_connected(self):
        """
        Returns:
            True if is connected to a real device
            False if is using a virtual device
        """
        with self._mutex:
            return self._device.is_connected

    @property
    def status(self):
        """
        Returns:
            dict with the current status:
                * running: True if there is a drawing going on
                * paused: if the device is paused
                * progress: the progress of the current element
        """
        with self._mutex:
            self._status.progress = (
                self._current_element.get_progress(self._device.estimator.feedrate)
                if not self._current_element is None
                else UNKNOWN_PROGRESS
            )
            return self._status

    @property
    def current_element(self):
        """
        Returns:
            currently being used element
        """
        with self._mutex:
            return self._current_element

    def pause(self):
        """
        Pause the current drawing
        """
        with self._mutex:
            self._status.paused = True
        self.logger.info("Paused")

    def resume(self):
        """
        Resume the current paused drawing
        """
        with self._mutex:
            self._status.paused = False
        self.logger.info("Resumed")

    def stop(self):
        """
        Stop the current element

        This is a blocking function. Will wait until the element is completely stopped before going on with the execution
        """
        # TODO: make it non blocking since the even is called when the drawing is stopped
        with self._mutex:
            # if is not running, no need to stop it
            if not self._status.running:
                return

            tmp = (
                self._current_element
            )  # store the current element to raise the "on_element_ended" callback
            self._current_element = None
            self._status.running = False
            if not self._stopped:
                self.logger.info("Stopping drawing")
        while True:
            with self._mutex:
                if self._stopped:
                    break

        with self._mutex:
            # waiting comand buffer to be cleared before calling the "drawing ended" event
            while True:
                if len(self._device.buffer) == 0:
                    break

            # clean the device status
            self._device.reset_status()

            # call the element ended callback
            self.event_handler.on_element_ended(tmp)

    def send_gcode_command(self, command):
        """
        Send a gcode command to the device
        """
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

    def start_element(self, element: GenericPlaylistElement):
        """
        Start the given element

        The element will start only if the feeder is not running.
        If there is already something running will not run the element and return False.
        To run an element must first stop the feeder. The "on_element_ended" callback will be raised when the device is stopped

        Args:
            element: the element to be played

        Returns:
            True if the element is being started, False otherwise
        """
        with self._mutex:
            # if is already running something and the force_stop is not set will return False directly
            if self._status.running:
                return False

            # starting the thread
            self.__th = Thread(target=self.__thf, daemon=True)
            self.__th.name = "feeder_send_element"

            # resetting status
            self._status.running = True
            self._status.paused = False
            self._stopped = False
            self._current_element = element
            self._device.buffer.clear()
            # starting the thread
            self.__th.start()

            # callback for the element being started
            self.event_handler.on_element_started(element)

            return True

    def update_current_time_element(self, new_interval):
        """
        If the current element is a TimeElement, allow to change the interval value to update the due date

        Args:
            new_interval: the new interval value for the TimeElement
        """
        with self._mutex:
            if type(self._current_element) is TimeElement:
                if self._current_element.type == "delay":
                    self._current_element.update_delay(new_interval)

    # event handler methods

    def on_line_sent(self, line):
        self.event_handler.on_new_line(line)

    def on_line_received(self, line):
        self.event_handler.on_message_received(line)

    def on_device_ready(self):
        self.logger.info(f"\nDevice ready.\n{self._device}\n")
        self.send_script(self.settings["scripts"]["connected"]["value"])

    # private methods

    def __thf(self):
        """
        This function handle the element once the start element method is called

        This function must not be called directly but will run in a separate thread
        """
        # run the "before" script only if the given element is a drawing
        with self._mutex:
            if isinstance(self._current_element, DrawingElement):
                self.send_script(self.settings["scripts"]["before"]["value"])

            self.logger.info(f"Starting new drawing with code {self._current_element}")

        # TODO add "scale/fit/clip" filters

        # execute the command (iterate over the lines/commands or just execute what is necessary)
        for k, line in enumerate(self._current_element.execute(self.logger)):
            # if the feeder is being stopped the running flag will be False -> should exit the loop immediately
            with self._mutex:
                if not self._status.running:
                    break

            # if the line is None should just go to the next iteration
            if line is None:
                continue
            self.send_gcode_command(line)  # send the line to the device

            # if the feeder is paused should just wait until the drawing is resumed
            while True:
                with self._mutex:
                    # if not paused or if a stop command is used should exit the loop
                    if not self._status.paused or not self._status.running:
                        break
                    time.sleep(0.1)

        # run the "after" script only if the given element is a drawing
        with self._mutex:
            if isinstance(self._current_element, DrawingElement):
                self.send_script(self.settings["scripts"]["after"]["value"])

            self._stopped = True
            if self._status.running:
                self.stop()
