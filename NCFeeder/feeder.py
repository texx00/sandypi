from threading import Thread, Lock
from queue import Queue
import os
from pathlib import Path

import time

class Feeder():
    def __init__(self):
        self.q = Queue()
        self._isrunning = False
        self._th = None
        self.mutex = Lock()

        self.serial = FakeSerial()  # TODO substitute this with a real serial if available (if there is something connected)

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
                self._isdone = False
                self._running_code = code
                self._th.start()

    # add a code to the queue
    def queue_code(self, code):
        if self.q.empty() and not self.is_running():
            self.start_code(gcode)
            return
        self.q.put(code)

    # ask if the feeder is already sending a file
    def is_running(self):
        with self.mutex:
            return self._isrunning

    # ask if the feeder is paused
    def is_paused(self):
        with self.mutex:
            return self._ispaused

    # return the code of the drawing on the go
    def get_drawing_code():
        with self.mutex:
            return self._present_code
    
    # return the content of the queue as a string
    def queue_str(self):
        return str(self.q.queue)

    # clear the queue
    def clear_queue(self):
        with self.mutex:
            self.q.queue.clear()

    def queue_length(self):
        with self.mutex:
            return self.q.qsize()

    # start the next drawing of the queue
    # by default will start it only if not already printing something
    # with "force_stop = True" will stop the actual drawing and start the next
    def start_next(self, force_stop=False):
        if(self.is_running()):
            if(force_stop):
                self.stop()
            else: return False
        if self.queue_length() > 0:
            self.start_code(self.q.queue.pop())
            return True
        return False
    
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
            with open(filename, "r") as file:
                for line in file:
                    if not self.is_running():
                        break
                    if self.is_paused():
                        continue
                    if not line[0]==";":
                        # TODO add line number (N***)
                        # TODO parse line to scale/add padding to the drawing according to the drawing settings (in order to keep the original .gcode file)
                        with self.mutex:
                            self.serial.send(line)
            with self.mutex:
                if self.q.qsize()>0:
                    code = self.q.queue.pop()
                else: break
                    

        print("Exiting thread")

# Fake serial class to be used when nothing is connected and for development purposes
class FakeSerial():
    def send(self, obj):
        print(obj)
        #time.sleep(0.01)

# tests
if __name__ == "__main__":
    fed = Feeder()

    fed.start_code(10)

    fed.start_code(11)
    fed.queue_code(12)
    fed.queue_code(13)
    print(fed.queue_str())

    time.sleep(2)
    
    if(fed.start_next()):
        print("Starting drawing without stopping")
    
    if(fed.start_next(force_stop=True)):
        print("Stopping feeder and starting next drawing")

    fed._th.join()