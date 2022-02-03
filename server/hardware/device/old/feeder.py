from threading import Thread, Lock
import os
import time
import traceback
from collections import deque
from copy import deepcopy
import re
import logging
from dotenv import load_dotenv
from dotmap import DotMap
from py_expression_eval import Parser

from server.utils import limited_size_dict, buffered_timeout, settings_utils
from server.utils.logging_utils import formatter, MultiprocessRotatingFileHandler
from server.hardware.device.feeder_event_handler import FeederEventHandler
from server.hardware.device.device_serial import DeviceSerial
from server.hardware.device.gcode_rescalers import Fit
import server.hardware.device.firmware_defaults as firmware
from server.database.playlist_elements import DrawingElement, TimeElement
from server.database.generic_playlist_element import UNKNOWN_PROGRESS

"""

This class duty is to send commands to the hw. It can handle single commands as well as elements.


"""

# List of commands that are buffered by the controller
BUFFERED_COMMANDS = ("G0", "G00", "G1", "G01", "G2", "G02", "G3", "G03", "G28")
# Defines the character used to define macros
MACRO_CHAR = "&"


class Feeder:
    def __init__(self, handler=None, **kargvs):

        # logger setup
        self.logger = logging.getLogger(__name__)
        self.logger.handlers = []  # remove all handlers
        self.logger.propagate = False  # set it to False to avoid passing it to the parent logger
        # add custom logging levels
        logging.addLevelName(settings_utils.LINE_SENT, "LINE_SENT")
        logging.addLevelName(settings_utils.LINE_RECEIVED, "LINE_RECEIVED")
        logging.addLevelName(settings_utils.LINE_SERVICE, "LINE_SERVICE")
        self.logger.setLevel(settings_utils.LINE_SERVICE)  # set to logger lowest level

        # create file logging handler
        file_handler = MultiprocessRotatingFileHandler(
            "server/logs/feeder.log", maxBytes=200000, backupCount=5
        )
        file_handler.setLevel(settings_utils.LINE_SERVICE)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        # load sterr logging level from environment variables
        load_dotenv()
        level = os.getenv("FEEDER_LEVEL")
        if not level is None:
            level = int(level)
        else:
            level = 0

        # create stream handler
        stream_handler = logging.StreamHandler()
        stream_handler.setLevel(level)
        stream_handler.setFormatter(formatter)
        self.logger.addHandler(stream_handler)

        settings_utils.print_level(level, __name__.split(".")[-1])

        # variables setup

        self._current_element = None
        self._is_running = False
        self._stopped = False
        self._is_paused = False
        self._th = None
        self.serial_mutex = Lock()
        self.status_mutex = Lock()
        if handler is None:
            self.handler = FeederEventHandler()
        else:
            self.handler = handler
        self.serial = DeviceSerial(logger_name=__name__)
        self.line_number = 0
        self._timeout_last_line = self.line_number
        self.feedrate = 0
        self.last_commanded_position = DotMap({"x": 0, "y": 0})

        # commands parser
        self.feed_regex = re.compile(
            "[F]([0-9.-]+)($|\s)"
        )  # looks for a +/- float number after an F, until the first space or the end of the line
        self.x_regex = re.compile(
            "[X]([0-9.-]+)($|\s)"
        )  # looks for a +/- float number after an X, until the first space or the end of the line
        self.y_regex = re.compile(
            "[Y]([0-9.-]+)($|\s)"
        )  # looks for a +/- float number after an Y, until the first space or the end of the line
        self.macro_regex = re.compile(
            MACRO_CHAR + "(.*?)" + MACRO_CHAR
        )  # looks for stuff between two "%" symbols. Used to parse macros

        self.macro_parser = Parser()  # macro expressions parser

        # buffer controll attrs
        self.command_buffer = deque()
        self.command_buffer_mutex = Lock()  # mutex used to modify the command buffer
        self.command_send_mutex = Lock()  # mutex used to pause the thread when the buffer is full
        self.command_buffer_max_length = 8
        self.command_buffer_history = limited_size_dict.LimitedSizeDict(
            size_limit=self.command_buffer_max_length + 40
        )  # keep saved the last n commands
        self._buffered_line = ""

        self._timeout = buffered_timeout.BufferTimeout(30, self._on_timeout)
        self._timeout.start()

        # device specific options
        self.update_settings(settings_utils.load_settings())

    def close(self):
        self.serial.close()

    def get_status(self):
        with self.status_mutex:
            return {
                "is_running": self._is_running,
                "progress": self._current_element.get_progress(self.feedrate)
                if not self._current_element is None
                else UNKNOWN_PROGRESS,
                "is_paused": self._is_paused,
            }

    # starts to send gcode to the machine
    def start_element(self, element, force_stop=False):
        if (not force_stop) and self.is_running():
            return False  # if a file is already being sent it will not start a new one
        else:
            if self.is_running():
                self.stop()  # stop -> blocking function: wait until the thread is stopped for real
            with self.serial_mutex:
                self._th = Thread(target=self._thf, args=(element,), daemon=True)
                self._th.name = "drawing_feeder"
                self._is_running = True
                self._stopped = False
                self._is_paused = False
                self._current_element = element
                if self.command_send_mutex.locked():
                    self.command_send_mutex.release()
                with self.command_buffer_mutex:
                    self.command_buffer.clear()
                self._th.start()
            self.handler.on_element_started(element)

    # ask if the feeder is already sending a file
    def is_running(self):
        with self.status_mutex:
            return self._is_running

    # ask if the feeder is paused
    def is_paused(self):
        with self.status_mutex:
            return self._is_paused

    # return the code of the drawing on the go
    def get_element(self):
        with self.status_mutex:
            return self._current_element

    def update_current_time_element(self, new_interval):
        with self.status_mutex:
            if type(self._current_element) is TimeElement:
                if self._current_element.type == "delay":
                    self._current_element.update_delay(new_interval)

    # stops the drawing
    # blocking function: waits until the thread is stopped
    def stop(self):
        if self.is_running():
            tmp = self._current_element
            with self.status_mutex:
                if not self._stopped:
                    self.logger.info("Stopping drawing")
                self._is_running = False
                self._current_element = None
            # block the function until the thread is stopped otherwise the thread may still be running when the new thread is started
            # (_isrunning will turn True and the old thread will keep going)
            while True:
                with self.status_mutex:
                    if self._stopped:
                        break

            # waiting command buffer to be clear before calling the "drawing ended" event
            while True:
                self.send_gcode_command(
                    firmware.get_buffer_command(self._firmware), hide_command=True
                )
                time.sleep(
                    3
                )  # wait 3 second to get the time to the board to answer. If the time here is reduced too much will fill the buffer history with buffer_commands and may loose the needed line in a resend command for marlin
                # the "buffer_command" will raise a response from the board that will be handled by the parser to empty the buffer

                # wait until the buffer is empty to know that the job is done
                with self.command_buffer_mutex:
                    if len(self.command_buffer) == 0:
                        break
            # resetting line number between drawings
            self._reset_line_number()
            # calling "drawing ended" event
            self.handler.on_element_ended(tmp)

    # pauses the drawing
    # can resume with "resume()"
    def pause(self):
        with self.status_mutex:
            self._is_paused = True
        self.logger.info("Paused")

    # resumes the drawing (only if used with "pause()" and not "stop()")
    def resume(self):
        with self.status_mutex:
            self._is_paused = False
        self.logger.info("Resumed")

    def serial_ports_list(self):
        result = []
        if not self.serial is None:
            result = self.serial.serial_port_list()
        return result

    def is_connected(self):
        with self.serial_mutex:
            return self.serial.is_connected()

    # ----- PRIVATE METHODS -----

    # run the "_on_device_ready" method with a delay
    def _on_device_ready_delay(self):
        def delay():
            time.sleep(5)
            self._on_device_ready()

        th = Thread(target=delay, daemon=True)
        th.name = "waiting_device_ready"
        th.start()

    # thread function
    # TODO move this function in a different class?
    def _thf(self, element):
        # runs the script only it the element is a drawing, otherwise will skip the "before" script
        if isinstance(element, DrawingElement):
            self.send_script(self.settings["scripts"]["before"]["value"])

        self.logger.info("Starting new drawing with code {}".format(element))

        # TODO retrieve saved information for the gcode filter
        dims = {
            "table_x": 100,
            "table_y": 100,
            "drawing_max_x": 100,
            "drawing_max_y": 100,
            "drawing_min_x": 0,
            "drawing_min_y": 0,
        }

        filter = Fit(dims)

        for k, line in enumerate(
            self.get_element().execute(self.logger)
        ):  # execute the element (iterate over the commands or do what the element is designed for)
            if not self.is_running():
                break

            if (
                line is None
            ):  # if the line is none there is no command to send, will continue with the next element execution (for example, within the delay element it will sleep 1s at a time and return None until the timeout passed. TODO Not really an efficient way, may change it in the future)
                continue

            line = line.upper()

            self.send_gcode_command(line)

            while self.is_paused():
                time.sleep(0.1)
                # if a "stop" command is raised must exit the pause and stop the drawing
                if not self.is_running():
                    break

            # TODO parse line to scale/add padding to the drawing according to the drawing settings (in order to keep the original .gcode file)
            # line = filter.parse_line(line)
            # line = "N{} ".format(file_line) + line
        with self.status_mutex:
            self._stopped = True

        # runs the script only it the element is a drawing, otherwise will skip the "after" script
        if isinstance(element, DrawingElement):
            self.send_script(self.settings["scripts"]["after"]["value"])
        if self.is_running():
            self.stop()

    # thread that keep reading the serial port
    def on_serial_read(self, l):
        if not l is None:
            # readline is not returning the full line but only a buffer
            # must break the line on "\n" to correctly parse the result
            self._buffered_line += l
            if "\n" in self._buffered_line:
                self._buffered_line = self._buffered_line.replace("\r", "").split("\n")
                if len(self._buffered_line) > 1:
                    for l in self._buffered_line[
                        0:-1
                    ]:  # parse single lines if multiple \n are detected
                        self._parse_device_line(l)
                self._buffered_line = str(self._buffered_line[-1])
