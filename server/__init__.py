import os
import logging
from threading import Thread
from time import sleep

from dotenv import load_dotenv

from flask import Flask, url_for
from flask.helpers import send_from_directory
from flask_socketio import SocketIO
from engineio.payload import Payload
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

from werkzeug.utils import secure_filename

from server.utils import settings_utils, software_updates, migrations
from server.utils.diagnostic import generate_diagnostic_zip
from server.utils.logging_utils import server_stream_handler, server_file_handler


# Updating setting files (will apply changes only when a new SW version is installed)
settings_utils.update_settings_file_version()

# Logging setup
load_dotenv()
level = os.getenv("FLASK_LEVEL")
if not level is None:
    level = int(level)
else:
    level = 0
settings_utils.print_level(level, "app")

server_stream_handler.setLevel(level)

w_logger = logging.getLogger("werkzeug")
w_logger.setLevel(1)
w_logger.handlers = []

w_logger.addHandler(server_stream_handler)
w_logger.addHandler(server_file_handler)
w_logger.propagate = False


# app setup
# is using the frontend build forlder for the static path
app = Flask(
    __name__, template_folder="templates", static_folder="../frontend/build", static_url_path="/"
)

app.logger.setLevel(1)
w_logger.addHandler(server_stream_handler)
w_logger.addHandler(server_file_handler)

app.config["SECRET_KEY"] = "secret!"  # TODO put a key here
app.config["UPLOAD_FOLDER"] = "./server/static/Drawings"

# increasing this number increases CPU usage but it may be necessary to be able to run leds in realtime (default should be 16)
Payload.max_decode_packets = 200

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)  # setting up cors for react


# Home routes
@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/Drawings/<path:filename>")
def base_static(filename):
    """
    Send back the required drawing preview
    """
    filename = secure_filename(filename)
    return send_from_directory(
        app.root_path
        + app.config["UPLOAD_FOLDER"].replace("./server", "")
        + "/{}/".format(filename),
        "{}.jpg".format(filename),
    )


@app.route("/diagnostics")
def download_diagnostics():
    """
    Route to download the diagnostics zip file
    """
    zip_path = generate_diagnostic_zip()
    return send_from_directory("static", os.path.basename(zip_path))


# database
DATABASE_FILENAME = os.path.join("server", "database", "db", "database.db")
dbpath = os.environ.get("DB_PATH")
if not dbpath is None:
    file_path = os.path.join(dbpath, DATABASE_FILENAME)
else:
    file_path = os.path.join(os.path.abspath(os.getcwd()), DATABASE_FILENAME)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + file_path
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db, include_object=migrations.include_object)

# After setting up the database it is possible to import the app components
try:
    import server.api.drawings
    from server.sockets_interface.socketio_emits import SocketioEmits
    import server.sockets_interface.socketio_callbacks
    from server.hardware.feeder_event_manager import FeederEventManager
    from server.hardware.device.feeder import Feeder
    from server.hardware.queue_manager import QueueManager
    from server.preprocessing.file_observer import GcodeObserverManager
    from server.hardware.leds.leds_controller import LedsController
    from server.hardware.buttons.buttons_manager import ButtonsManager
    from server.utils.stats import StatsManager

except Exception as e:
    app.logger.exception(e)

# Initializes sockets emits
app.semits = SocketioEmits(app, socketio, db)

# Device controller initialization
app.feeder = Feeder(FeederEventManager(app))
app.qmanager = QueueManager(app, socketio)

# Buttons controller initialization
app.bmanager = ButtonsManager(app)

# Leds controller initialization
app.lmanager = LedsController(app)

# Updates manager
app.umanager = software_updates.UpdatesManager()

# Stats manager
app.smanager = StatsManager()


@app.context_processor
def override_url_for():
    return dict(url_for=versioned_url_for)


# Adds a version number to the static url to update the cached files when a new version of the software is loaded
def versioned_url_for(endpoint, **values):
    if endpoint == "static":
        pass
        values["version"] = app.umanager.short_hash
    return url_for(endpoint, **values)


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.close()
    db.engine.dispose()


# Starting the feeder after the server is ready to avoid problems with the web page not showing up
def run_post():
    sleep(2)
    app.lmanager.start()


th = Thread(target=run_post, daemon=True)
th.name = "feeder_starter"
th.start()

# File observer setup
# initializes the .gcode file observer on the autostart folder
app.observer = GcodeObserverManager("./server/autodetect", logger=app.logger)

if __name__ == "__main__":
    socketio.run(app, threaded=True)
