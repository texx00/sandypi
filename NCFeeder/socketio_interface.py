import socketio
import atexit
from flask_socketio import emit

try:
    print(sio)
except:
    sio = socketio.Client()

def init():
    sio.connect('http://127.0.0.1:5000')
    atexit.register(at_exit)
    print("Connected")

def at_exit():
    sio.disconnect()

def send_command(command):
    sio.emit("server_command", command)

def disconnect():
    sio.disconnect()

# Events

@sio.on('bot_start')
def start_gcode(code):
    print("Code: "+code)