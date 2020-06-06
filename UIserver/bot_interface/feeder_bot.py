class FeederBot():
    def __init__(self, app, socketio):
        self._isdrawing = False
        self._code = None
        self.app = app
        self.socketio = socketio
    
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
    
    def update_status(self):
        pass
        # in this method should ask the updated status to the feeder (like if is drawing, queue and if necessary other stuff)

    # This method send a "start" command to the bot with the code of the drawing
    def start_drawing(self, code):
        self.app.logger.info("Sending gcode start command")
        self.socketio.emit('bot_start', str(code))

    # This method send a "queue" command to the bot with the code of the drawing to add to the queue
    def queue_drawing(self, code):
        self.app.logger.info("Sending queue command")
        self.socketio.emit('bot_queue', str(code))