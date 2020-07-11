from flask import Flask, redirect, url_for
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
import os
import sys
import logging
from subprocess import Popen
import psutil
import threading
import atexit
import signal
import urllib.request
import platform
from time import sleep
from UIserver.bot_interface.queue_manager import QueueManager

app = Flask(__name__, template_folder='templates')
app.logger.setLevel(logging.INFO)

app.config['SECRET_KEY'] = 'secret!' # TODO put a key here
app.config['UPLOAD_FOLDER'] = "./UIserver/static/Drawings"
socketio = SocketIO(app)

file_path = os.path.abspath(os.getcwd())+"\database.db"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+file_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.qmanager = QueueManager(app, socketio)

import UIserver.database
import UIserver.views.drawings_management, UIserver.views.settings
import UIserver.bot_interface.socketio_callbacks


# This section starts the feeder or restarts it if already running when the server is restarted

# Wait until the server is ready
def wait_server_ready():
    while urllib.request.urlopen("http://localhost:5000").getcode() != 200:
        pass
    start_feeder_process()

# run the waiting function in a thread
starter_thread = threading.Thread(target=wait_server_ready, daemon=True)
starter_thread.start()

# starts the process
def start_feeder_process():
    try:
        # If the "RUN_FEEDER_MANUALLY" environment variable is set to 'true', the server will not start the feeder which must then be started manually. 
        # Can be usefull when working on the feeder and it is not necessary to restart the server every time.
        # To start the feeder manually can use "python NCFeeder/run.py" or also the debugger
        if os.environ['RUN_FEEDER_MANUALLY'] == 'true':
            return
    except:
        pass

    
    # terminal window is available only on windows
    if platform.system() == "Windows":
        filename = os.path.dirname(__file__) + "\\..\\NCFeeder\\run.py"
    
        from subprocess import CREATE_NEW_CONSOLE, CREATE_NO_WINDOW
        
        try:
            # Check if the environment variable is set. If it is will show the ncfeeder terminal window, otherwise will keep it hidden
            create_window = CREATE_NEW_CONSOLE if os.environ['SHOW_FEEDER_TERMINAL'] == 'true' else CREATE_NO_WINDOW
        except:
            create_window = CREATE_NO_WINDOW
        feeder_process = Popen("env/Scripts/activate.bat & python NCFeeder/run.py", env=os.environ.copy(), creationflags=create_window)
    else:
        filename = os.path.dirname(__file__) + "/../NCFeeder/run.py"
        feeder_process = Popen(["python3", filename],  env=os.environ.copy())
    app.feeder_pid = feeder_process.pid

@atexit.register
def terminate_feeder_process():
    try:
        # The feeder_process cannot be killed or terminated if saved into the app directly.
        # Instead of saving the process object save the pid and kill it with that
        process = psutil.Process(app.feeder_pid)
        for proc in process.children(recursive=True):
            proc.kill()
        process.kill()
    except:
        pass

# Home routes
@app.route('/')
def home():
    return redirect(url_for('preview'))

if __name__ == '__main__':
    socketio.run(app)
