from UIserver import socketio, app, db
from flask import render_template
from UIserver.database import UploadedFiles, Playlists
import pickle
import datetime
from utils import settings_utils

def show_message_on_UI(message):
    socketio.emit("message_container", message)

@socketio.on('connect')
def on_connect():
    #app.logger.info("Connected")
    pass


# ---- Frontend callbacks ----

@socketio.on('message')
def handle_message(message):
    app.logger.info("Received message from js")
    res = message['data'].split(":")
    if res[0]=="start":
        app.qmanager.start_drawing(res[1])
    if res[0]=="queue":
        app.qmanager.queue_drawing(res[1])

@socketio.on("request_nav_drawing_status")
def nav_drawing_request():
    if app.qmanager.is_drawing():
        item = db.session.query(UploadedFiles).filter(UploadedFiles.id==app.qmanager.get_code()).one()
        socketio.emit("current_drawing_preview", render_template("drawing_status.html", item=item))
    else: 
        socketio.emit("current_drawing_preview", "")
    
# playlist sockets
# save the changes to the playlist
@socketio.on("playlist_save")
def playlist_save(pls):
    pls = pls['data']   # data is a dict itself with the data to save
    item = db.session.query(Playlists).filter(Playlists.id==int(pls['id']))
    for i in item:  # should be just one
        i.name = pls['name']
        i.edit_date = datetime.datetime.utcnow()
    db.session.commit()
    app.logger.info("Saved")

@socketio.on("add_to_playlist")
def add_to_playlist(drawing_code, playlist_code):
    item = db.session.query(Playlists).filter(Playlists.id==playlist_code).one()
    item.drawings = item.drawings +"{},".format(drawing_code)
    item.edit_date = datetime.datetime.utcnow()
    db.session.commit()
    # TODO add the information about the playlists also in the single drawing?

# save the settings
@socketio.on("save_settings")
def save_settings(data, is_connect):
    settings_utils.save_settings(data)
    show_message_on_UI("Settings saved")
    if is_connect:
        app.logger.info("Connecting device")
        socketio.emit("connect_to_device")

@socketio.on("send_gcode_command")
def send_gcode_command(command):
    socketio.emit("gcode_command", command)

# ---- NCFeeder callbacks ----

# receives the list of serial ports available and redirect them to the js frontend
@socketio.on('serial_list')
def on_serial_list(slist):
    slist = pickle.loads(slist)
    app.logger.info(slist)    
    socketio.emit("serial_list_show", slist)

@socketio.on('drawing_ended')
def on_drawing_ended():
    app.logger.info("B> Drawing ended")
    show_message_on_UI("Drawing ended")
    nav_drawing_request()
    app.qmanager.set_is_drawing(False)
    app.qmanager.start_next()

@socketio.on('drawing_started')
def on_drawing_started(code):
    app.logger.info("B> Drawing started")
    show_message_on_UI("Drawing started")
    app.qmanager.set_code(code)
    nav_drawing_request()

@socketio.on("feeder_status")
def on_feeder_status(status):
    feeder = pickle.loads(status)
    # TODO show the updated status in the UI
    app.logger.info("Status: " + str(feeder))

@socketio.on("message_to_frontend")
def message_to_frontend(message):
    show_message_on_UI(message)

@socketio.on("message_from_device")
def message_from_device(message):
    socketio.emit("frontend_message_from_device", message)