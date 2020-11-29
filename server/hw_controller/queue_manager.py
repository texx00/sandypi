from queue import Queue
import json

class QueueManager():
    def __init__(self, app, socketio):
        self._isdrawing = False
        self._code = None
        self.app = app
        self.socketio = socketio
        self.q = Queue()
    
    def is_drawing(self):
        return self._isdrawing

    def set_is_drawing(self, dr):
        self._isdrawing = dr

    def get_code(self):
        return self._code
    
    def set_code(self, code):
        self.app.logger.info("Code: {}".format(code))
        self._code = code
        self.set_is_drawing(True)

    # add a code to the queue
    def queue_drawing(self, code):
        if self.q.empty() and not self.is_drawing():
            self.start_drawing(code)
            return
        self.app.logger.info("Adding {} to the queue".format(code))
        self.q.put(code)
        self.send_queue_status()

    # return the content of the queue as a string
    def queue_str(self):
        return str(self.q.queue)
    
    def get_queue(self):
        return self.q.queue

    # clear the queue
    def clear_queue(self):
        self.q.queue.clear()
    
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
    
    def update_status(self):
        pass
        # in this method should ask the updated status to the feeder (like if is drawing, queue and if necessary other stuff)

    # start the next drawing of the queue
    # by default will start it only if not already printing something
    # with "force_stop = True" will stop the actual drawing and start the next
    def start_next(self, force_stop=False):
        if(self.is_drawing()):
            if not force_stop:
                return False
        try:
            if self.queue_length() > 0:
                self.start_drawing(self.q.queue.popleft())
                self.app.logger.info("Starting next code")
                return True
            self._code = None
            self.send_queue_status()
            return False
        except Exception as e:
            self.app.logger.error("An error occured while starting a new drawing from the queue:\n{}".format(str(e)))
            self.start_next()

    # This method send a "start" command to the bot with the code of the drawing
    def start_drawing(self, code):
        self.app.logger.info("Sending gcode start command")
        self.app.feeder.start_code(code, force_stop = True)

    def send_queue_status(self):
        res = {
            "now_drawing_id": self._code if self._code is not None else 0,
            "queue": list(self.q.queue)
        }
        self.app.semits.emit("queue_status", json.dumps(res))