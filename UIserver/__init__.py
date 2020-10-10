from flask import Flask, redirect, url_for
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
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
from UIserver.hw_controller.queue_manager import QueueManager
from UIserver.hw_controller.feeder import Feeder
from UIserver.hw_controller.feeder_event_manager import FeederEventManager
from UIserver.sockets_interface.socketio_emits import SocketioEmits
import sass
from flask_minify import minify
from utils import settings_utils, software_updates

app = Flask(__name__, template_folder='templates')

# Logging setup
app.logger.setLevel(logging.INFO)
logging.getLogger("werkzeug").setLevel('WARNING')


app.config['SECRET_KEY'] = 'secret!' # TODO put a key here
app.config['UPLOAD_FOLDER'] = "./UIserver/static/Drawings"
socketio = SocketIO(app)
app.semits = SocketioEmits(socketio)

file_path = os.path.abspath(os.getcwd())+"\database.db"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+file_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# scss compiler (already minified)
sass.compile(dirname=(os.path.abspath(os.getcwd())+"/UIserver/static/scss", os.path.abspath(os.getcwd())+"/UIserver/static/css"), output_style='compressed')
# js and html minifier (on request)
minify(app=app, html=True, js=False)


import UIserver.database
import UIserver.views.drawings_management, UIserver.views.settings
import UIserver.sockets_interface.socketio_callbacks

# Device controller initialization

app.feeder = Feeder(FeederEventManager(app))
app.feeder.connect()
app.qmanager = QueueManager(app, socketio)

# Context pre-processor variables
# Global template values to be injected before templates creation
global_context_dict = dict(
    # System check
    is_windows = platform.system() == "Windows",
    is_linux = platform.system() != "Windows",
    # Loads settings
    settings = settings_utils.load_settings()
)
# Get lates commit short hash to use as a version to refresh cached files
sw_version = software_updates.get_commit_shash()

# Inject globals context before creating templates
@app.context_processor
def inject_global_context():
    global_context_dict["settings"] = settings_utils.load_settings()  # loads the latest settings
    return global_context_dict

@app.context_processor
def override_url_for():
    return dict(url_for=versioned_url_for)

# Adds a version number to the static url to update the cached files when a new version of the software is loaded
def versioned_url_for(endpoint, **values):
    if endpoint == 'static':
        values["version"] = sw_version
    return url_for(endpoint, **values)


# Home routes
@app.route('/')
def home():
    return redirect(url_for('preview'))

if __name__ == '__main__':
    socketio.run(app)
