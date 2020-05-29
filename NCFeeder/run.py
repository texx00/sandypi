import socketio_interface
import socketio
import atexit
from flask_socketio import emit

def init():
    sio.connect('http://127.0.0.1:5000')
    atexit.register(at_exit)
    print("Connected")

def at_exit():
    sio.disconnect()

def send_command(command):
    sio.emit("server_command", command)

sio = socketio.Client()
init()

send_command("test")
print("sent")

@sio.on('bot_command')
def parse(response):
    print("Response: " +  response)

sio.wait()