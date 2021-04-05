from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler

import logging
import os
import fnmatch
from time import sleep

from server.preprocessing.drawing_creator import preprocess_drawing
from server.sockets_interface.socketio_callbacks import drawings_refresh

class GcodeObserverManager:
    def __init__(self, path=".", logger=None):
        if logger is None:
            logger_name = __name__
            self._logger = logging.getLogger(logger_name)
        else: 
            self._logger = logger
        self._path = path
        self._observer = Observer()
        self._handler = GcodeEventHandler(self._logger)
        self._observer.schedule(self._handler, path=path)
        self.start()
        self.check_current_files()

    def start(self):
        self._observer.start()
    
    def stop(self):
        self._observer.stop()
        self._observer.join()

    def check_current_files(self):
        files = fnmatch.filter(os.listdir(self._path), "*.gcode")
        if len(files)>0:
            self._logger.info("Found some files to load in the autodetect folder")
        for name in files:
            self._handler.init_drawing(os.path.join(self._path, name))


class GcodeEventHandler(PatternMatchingEventHandler):
    def __init__(self, logger):
        super().__init__(patterns=["*.gcode"])
        self._logger = logger

    def on_created(self, evt):
        self.handle_event(evt)
    
    def on_moved(self, evt):
        self.handle_event(evt)

    def handle_event(self, evt):
        self.init_drawing(evt.src_path)
    
    def init_drawing(self, filename):
        self._logger.info("Uploading autodetected file: {}".format(filename))
        try:
            id = ""
            with open(filename, "r") as f:
                short_filename = os.path.basename(f.name)
                id = preprocess_drawing(short_filename, f)
            sleep(1)
            os.remove(filename)
            self._logger.info("Autodetected drawing loaded with id: {}".format(id))
            # refreshing list of drawings for all the clients
            drawings_refresh()
        except Exception as e:
            logging.exception(e)
