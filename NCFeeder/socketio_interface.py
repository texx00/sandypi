import socketio
import atexit
from flask_socketio import emit
from feeder import Feeder, FeederEventHandler
import pickle

sio = socketio.Client()

class FeederEvents(FeederEventHandler):
    def on_drawing_ended(self):
        # Send a message to the server that the drawing is ended.
        print("S> Sending drawing ended")
        sio.emit("drawing_ended")

    def on_drawing_started(self):
        # Send a message to the server that a drawing has been started.
        print("S> Sending drawing started. Code: {}".format(sio.feeder.get_drawing_code()))
        sio.emit("drawing_started", sio.feeder.get_drawing_code())


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

# Socket events from the server

# Starts a new drawing (even if there was a drawing on the way already)
@sio.on('bot_start')
def start_gcode(code):
    sio.feeder.start_code(code, force_stop = True)

# Send the current status of the current drawing to the server
@sio.on('bot_status')
def send_status():
    sio.emit("feeder_status", pickle.dumps(sio.feeder.get_status()))