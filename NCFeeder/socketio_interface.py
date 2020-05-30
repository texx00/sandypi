import socketio
import atexit
from flask_socketio import emit

# TODO: change this to be a class

try:
    print(sio)
except:
    sio = socketio.Client()
# GCODE FEEDER

def init(feeder):
    sio.connect('http://127.0.0.1:5000')
    atexit.register(at_exit)
    print("Connected")
    sio.fed = feeder

def at_exit():
    sio.disconnect()

def send_command(command):
    sio.emit("server_command", command)

def disconnect():
    sio.disconnect()

# Events

@sio.on('bot_start')
def start_gcode(code):
    sio.fed.start_code(code, force_stop = True)

@sio.on('bot_queue')
def queue_gcode(code):
    sio.fed.queue_code(code)