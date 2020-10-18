from flask import Flask, redirect, url_for
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

import os
import sys
import platform

from subprocess import Popen
import psutil
import threading
import atexit
import signal
import urllib.request

from time import sleep
from dotenv import load_dotenv
import logging

import sass
from flask_minify import minify

from UIserver.hw_controller.queue_manager import QueueManager
from UIserver.hw_controller.feeder import Feeder
from UIserver.hw_controller.feeder_event_manager import FeederEventManager
from UIserver.utils import settings_utils, software_updates, migrations

# Logging setup
load_dotenv()
level = os.getenv("FLASK_LEVEL")
if not level is None:
    level = int(level)
else:
    level = 0
settings_utils.print_level(level, "app")
logging.getLogger("werkzeug").setLevel(level)

# app setup
app = Flask(__name__, template_folder='templates')

app.config['SECRET_KEY'] = 'secret!' # TODO put a key here
app.config['UPLOAD_FOLDER'] = "./UIserver/static/Drawings"
socketio = SocketIO(app)

# database
file_path = os.path.join(os.path.abspath(os.getcwd()), "database.db")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+file_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db, include_object=migrations.include_object)


# scss compiler (already minified)
if os.path.isdir('./UIserver/static/js/node_modules/bootstrap'):     # check if the bootstrap folder is available (it will not be available in the github workflow for testing)
    sass.compile(dirname=(os.path.abspath(os.getcwd())+"/UIserver/static/scss", os.path.abspath(os.getcwd())+"/UIserver/static/css"), output_style='compressed')
# js and html minifier (on request)
minify(app=app, html=True, js=False)


import UIserver.database.models
import UIserver.views.drawings_management, UIserver.views.settings
import UIserver.sockets_interface.socketio_callbacks
from UIserver.sockets_interface.socketio_emits import SocketioEmits

app.semits = SocketioEmits(app,socketio, db)

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
