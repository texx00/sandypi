from queue import Queue
import json
from threading import Thread
import time
import random

from server.utils import settings_utils
from server.hw_controller.continuous_queue_generator import ContinuousQueueGenerator
from server.database.playlist_elements import ShuffleElement, TimeElement

TIME_CONVERSION_FACTOR = 60*60      # hours to seconds

class QueueManager():
    def __init__(self, app, socketio):
        self._isdrawing     = False
        self._element       = None
        self.app            = app
        self.socketio       = socketio
        self.q              = Queue()
        self.repeat         = False                     # true if should not delete the current element from the queue
        self.shuffle        = False                     # true if should shuffle the queue
        self.interval       = 0                         # pause between drawing in repeat mode
        self._last_time     = 0                         # timestamp of the end of the last drawing
        self._is_force_stop = False
        self._is_random     = False                     # used when queueing random drawings

        # setup status timer
        self._th            = Thread(target=self._thf, daemon=True)
        self._th.name       = "queue_status_interval"
        self._th.start()
    
    def is_drawing(self):
        return self._isdrawing

    # pauses the feeder
    def pause(self):
        self.app.feeder.pause()
        self.send_queue_status()
        self.app.logger.info("Drawing paused")
    
    # resumes the feeder
    def resume(self):
        self.app.feeder.resume()
        self.send_queue_status()
        self.app.logger.info("Drawing resumed")

    # returns a boolean: true if the queue is empty and it is drawing, false otherwise
    def is_queue_empty(self):
        return not self._isdrawing and len(self.q.queue)==0

    def set_is_drawing(self, dr):
        self._isdrawing = dr

    # returns the current element
    def get_element(self):
        return self._element
    
    # set the current element
    def set_element(self, element):
        self.app.logger.info("Now running: {}".format(element))
        self._element = element

    # stop the current drawing and start the next
    def stop(self, is_random=False):
        self._is_random = is_random
        self._is_force_stop = True
        self.app.feeder.stop()

    # set the repeat flag
    def set_repeat(self, val):
        if type(val) == type(True):
            self.repeat = val
            if self._is_random:
                if val:
                    self.start_random_drawing()
                else:
                    self.clear_queue()
        else: raise ValueError("The argument must be boolean")

    # set the shuffle flag
    def set_shuffle(self, val):
        if self._is_random:         # can change the shuffle option only if is not playing a random drawing
            return
        if type(val) == type(True):
            self.shuffle = val
        else: raise ValueError("The argument must be boolean")

    # set the queue interval [h]
    def set_interval(self, val):
        self.interval = val

    # starts a random drawing from the uploaded files
    def start_random_drawing(self, repeat=False):
        self.set_shuffle(True)
        if self.q.empty():
            self.queue_element(ShuffleElement(shuffle_type="0"), is_random=True)                    # queue a new random element drawing
            if repeat:                                                                      # call again the same method only once to put an element in the queue
                self.start_random_drawing(False)
        else:
            if not self.is_drawing():
                self.queue_element(ShuffleElement(shuffle_type="0"), is_random=True)


    # add an element to the queue
    def queue_element(self, element, show_toast=True, is_random=False):
        self._is_random = is_random
        if self.q.empty() and not self.is_drawing():
            self.start_element(element)
            return
        self.app.logger.info("Adding {} to the queue".format(element))
        self.q.put(element)
        if show_toast:
            self.app.semits.show_toast_on_UI("Element added to the queue")
        self.send_queue_status()

    # return the content of the queue as a string
    def queue_str(self):
        return str(self.q.queue)
    
    def get_queue(self):
        return self.q.queue

    def set_element_ended(self):
        self.set_is_drawing(False)
        if self._is_random:
            self.start_random_drawing()
        # if the ended element was forced to stop should not set the "last_time" otherwise when a new element is started there will be a delay element first
        if self._is_force_stop:
            self._is_force_stop = False
        else:
            self._last_time = time.time()
        self.app.qmanager.start_next()

    # clear the queue
    def clear_queue(self):
        self.q.queue.clear()
    
    def set_new_order(self, elements):
        self.clear_queue()
        for el in elements:
            if el!= 0:
                self.q.put(el)
        self.send_queue_status()
    
    # remove the first element with the given code
    def remove(self, code):
        tmp = Queue()
        is_first = True
        for c in self.q.queue:
            if c == code and is_first:
                is_first = False
            else:
                tmp.put(c)
        self.q = tmp

    # queue length
    def queue_length(self):
        return self.q.qsize()
    
    # start the next drawing of the queue
    # by default will start it only if not already printing something
    # with "force_stop = True" will stop the actual drawing and start the next
    def start_next(self, force_stop=False):
        if(self.is_drawing()):
            if not force_stop:
                return False
            else: 
                # will reset the last_time to 0 in order to get the next element running without a delay and stop the current drawing. 
                # Once the current drawing the next drawing should start from the feeder event manager
                self._last_time = 0
                self.stop(self._is_random)
                return True
        try:
            # should not remove the element from the queue if repeat is active. Should just add it at the end of the queue
            if (not self._element is None) and (self.repeat) and (not hasattr(self._element, "_repeat_off") and (not self._is_random)):
                self.q.put(self._element)
            
            # if the time has not expired should start a new drawing otherwise should start a delay element
            if (self.interval != 0) and (not hasattr(self._element, "_repeat_off") and (self.queue_length()>0)):
                if (self._last_time + self.interval*TIME_CONVERSION_FACTOR > time.time()):
                    element = TimeElement(delay=self.interval*TIME_CONVERSION_FACTOR + time.time() - self._last_time, type="delay")
                    element._repeat_off = True              # when the "repeat" flag is selected, should not add this element to the queue
                    self.start_element(element)
                    return True
            
            self._element = None
            if self.queue_length() > 0:
                element = None
                # if shuffle is enabled select a random drawing from the queue otherwise uses the first element of the queue
                if self.shuffle:
                    tmp = None
                    elements = list(self.q.queue)
                    if len(elements)>1:  # if the list is longer than 2 will pop the last element to avoid using it again
                        tmp = elements.pop(-1)
                    element = elements.pop(random.randrange(len(elements)))
                    elements.append(tmp)
                    self.set_new_order(elements)
                else: 
                    element = self.q.queue.popleft()
                # starts the choosen element
                self.start_element(element)
                self.app.logger.info("Starting next element: {}".format(element))
                return True
            return False
        except Exception as e:
            self.app.logger.exception(e)
            self.app.logger.error("An error occured while starting a new drawing from the queue:\n{}".format(str(e)))
            self.start_next()

    # This method send a "start" command to the bot with the element
    def start_element(self, element):
        element = element.before_start(self.app)
        if not element is None:
            self.app.logger.info("Sending gcode start command")
            self.set_is_drawing(True)
            self.app.feeder.start_element(element, force_stop = True)
        else: self.start_next()

    # sends the queue status to the frontend
    def send_queue_status(self):
        elements = list(map(lambda x: str(x), self.q.queue)) if len(self.q.queue) > 0 else []                       # converts elements to json
        res = {
            "current_element":  str(self._element),
            "elements":         elements,
            "status":           self.app.feeder.get_status(),
            "repeat":           self.repeat,
            "shuffle":          self.shuffle,
            "interval":         self.interval
        }
        self.app.semits.emit("queue_status", json.dumps(res))
    
    # checks if should start drawing after the server is started and ready (can be set in the settings page)
    def check_autostart(self):
        autostart = settings_utils.get_only_values(settings_utils.load_settings()["autostart"])
        
        if autostart["on_ready"]:
            self.start_random_drawing(repeat=True)
            self.set_repeat(True)

            try:
                if autostart["interval"]:
                    self.set_interval(float(autostart["interval"]))
            except Exception as e:
                self.app.logger.exception(e)

    # periodically updates the queue status, used by the thread
    def _thf(self):
        while(True):
            try:
                # updates the queue status every 30 seconds but only while is drawing
                time.sleep(30)
                if self.is_drawing():
                    self.send_queue_status()
                
            except Exception as e:
                self.app.logger.exception(e)