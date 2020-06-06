from queue import Queue

class FeederBot():
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

    # return the content of the queue as a string
    def queue_str(self):
        return str(self.q.queue)

    # clear the queue
    def clear_queue(self):
        self.q.queue.clear()

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
        if self.queue_length() > 0:
            self.start_drawing(self.q.queue.pop())
            self.app.logger.info("Starting next code")
            return True
        return False

    # This method send a "start" command to the bot with the code of the drawing
    def start_drawing(self, code):
        self.app.logger.info("Sending gcode start command")
        self.socketio.emit('bot_start', str(code))
