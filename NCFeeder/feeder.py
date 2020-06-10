from threading import Thread, Lock
import os
from pathlib import Path
from gcode_rescalers import *
import time


class FeederEventHandler():
    def on_drawing_ended(self):
        pass

    def on_drawing_started(self):
        pass

class Feeder():
    def __init__(self, handler = None):
        self._isrunning = False
        self._ispaused = False
        self.total_commands_number = None
        self.command_number = 0
        self._th = None
        self.mutex = Lock()
        if handler is None:
            self.handler = FeederEventHandler()
        else: self.handler = handler
        self.serial = FakeSerial()  # TODO substitute this with a real serial if available (if there is something connected)

    def set_event_handler(self, handler):
        self.handler = handler

    # starts to send gcode to the machine
    def start_code(self, code, force_stop=False):
        if(not force_stop and self.is_running()):
            return False    # if a file is already being sent it will not start a new one
        else:
            if self.is_running():
                self.stop()
            with self.mutex:
                self._th = Thread(target = self._thf, args=(code,), daemon=True)
                self._isrunning = True
                self._ispaused = False
                self._running_code = code
                self.command_number = 0
                self._th.start()
            self.handler.on_drawing_started()

    # ask if the feeder is already sending a file
    def is_running(self):
        with self.mutex:
            return self._isrunning

    # ask if the feeder is paused
    def is_paused(self):
        with self.mutex:
            return self._ispaused

    # return the code of the drawing on the go
    def get_drawing_code(self):
        with self.mutex:
            return self._running_code
    
    # stops the drawing
    def stop(self):
        if(self.is_running()):
            with self.mutex:
                self._isrunning = False
    
    # pause the drawing
    # can resume with "resume()"
    def pause(self):
        with self.mutex:
            self._ispaused = True
    
    # resume the drawing (only if used with "pause()" and not "stop()")
    def resume(self):
        with self.mutex:
            self._ispaused = False

    # thread function
    def _thf(self, code):
        while True:
            print("Starting new drawing with code {}".format(code))
            with self.mutex:
                code = self._running_code
            filename = os.path.join(Path(__file__).parent.parent.absolute(), "UIserver/static/Drawings/{0}/{0}.gcode".format(code))
            
            # TODO retrieve saved information for the gcode filter
            dims = {"table_x":100, "table_y":100, "drawing_max_x":100, "drawing_max_y":100, "drawing_min_x":0, "drawing_min_y":0}
            # TODO calculate an estimate about the remaining time for the current drawing (for the moment can output the number of rows over the total number of lines in the file)
            self.total_commands_number = 10**6  # TODO change this placeholder

            filter = Fit(dims)
            
            with open(filename, "r") as file:
                file_line = 1
                for k, line in enumerate(file):
                    if not self.is_running():
                        break
                    while self.is_paused():
                        time.sleep(1)
                    if not line[0]==";":
                        # TODO parse line to scale/add padding to the drawing according to the drawing settings (in order to keep the original .gcode file)
                        line = filter.parse_line(line)
                        line = "N{} ".format(file_line) + line

                        # TODO should create a function/class to manage the connection with the controller
                        # for example: marlin is buffering the commands so it is necessary to put a check wheter the queue is full and should wait before sending the next move
                        # should also lost lines when requested by the controller (better to move the line number inside the class)

                        with self.mutex:
                            self.command_number = k
                            self.serial.send(line)
            self.handler.on_drawing_ended()
                    
        print("Exiting thread")
    
    def get_status(self):
        with self.mutex:
            return {"is_running":self._isrunning, "progress":[self.command_number, self.total_commands_number], "is_paused":self._ispaused}


# Fake serial class to be used when nothing is connected and for development purposes
class FakeSerial():
    def send(self, obj):
        print(obj)
        #time.sleep(2)
        pass

# tests
if __name__ == "__main__":
    fed = Feeder()

    fed.start_code(10)
