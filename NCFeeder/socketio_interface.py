import socketio
import atexit
from flask_socketio import emit
from NCFeeder.feeder import Feeder, FeederEventHandler

sio = socketio.Client()

class FeederEvents(FeederEventHandler):
    def on_drawing_ended(self):
        print("S> Sending drawing ended")
        sio.emit("drawing_ended")

    def on_drawing_started(self):
        print("S> Sending drawing started")
        sio.emit("drawing_started")


class SocketInterface():

    def __init__(self):
        sio.connect('http://127.0.0.1:5000')
        atexit.register(self.at_exit)
        print("Connected")
        events = FeederEvents()
        self.feeder = Feeder(events)
        sio.feeder = self.feeder

    def at_exit():
        sio.disconnect()

    def send_command(command):
        sio.emit("server_command", command)

    def disconnect():
        sio.disconnect()

# Events

@sio.on('bot_start')
def start_gcode(code):
    sio.feeder.start_code(code, force_stop = True)

@sio.on('bot_queue')
def queue_gcode(code):
    sio.feeder.queue_code(code)