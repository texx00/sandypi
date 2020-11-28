from flask import render_template

import pickle
import json
import datetime
import shutil

from server import socketio, app, db

from server.utils import settings_utils, software_updates
from server.database.models import Playlists
from server.database.playlist_elements import DrawingElement
from server.database.models import UploadedFiles, Playlists


@socketio.on('message')
def handle_message(message):
    app.logger.info("Received message from js")
    res = message['data'].split(":")
    if res[0]=="start":
        app.qmanager.start_drawing(res[1])
    if res[0]=="queue":
        app.qmanager.queue_drawing(res[1])

# 
@socketio.on('software_updates_check')
def handle_software_updates_check():
    result = software_updates.compare_local_remote_tags()
    if result:
        if result["behind_remote"]:
            toast = """A new update is available ({0}).<br>
            Your version is {1}.<br>
            Check <a href="https://github.com/texx00/sandypi">sandipy</a> github page to update to the latest version.
            """.format(result["remote_latest"], result["local"])
            socketio.emit("software_updates_response", toast)

@socketio.on("request_nav_drawing_status")
def nav_drawing_request():
    app.semits.send_nav_drawing_status()

# TODO split in multiple files?    

# --------------------------------------------------------- PLAYLISTS CALLBACKS -------------------------------------------------------------------------------

# save the changes to the playlist
@socketio.on("playlist_save")
def playlist_save(playlist):
    pl = Playlists.create_playlist() if playlist['id'] == 0 else Playlists.get_playlist(playlist['id'])
    pl.name = playlist['name']
    pl.clear_elements()
    pl.add_element(playlist['elements'])
    pl.save()

# add a drawing to a playlist
@socketio.on("playlist_add_element")
def playlist_add_element(element, playlist_code):
    pl = Playlists.get_playlist(playlist_code)
    pl.add_element(DrawingElement(element))
    pl.save()

# starts to draw a playlist
@socketio.on("playlist_start")
def playlist_start(code):
    item = db.session.query(Playlists).filter(Playlists.id==code).one()
    for i in item.elements.replace(" ", "").split(","):
        if i != "":
            app.qmanager.queue_drawing(i)

@socketio.on("playlists_refresh")
def playlist_refresh():
    playlists = db.session.query(Playlists).order_by(Playlists.edit_date.desc()).all()
    pls = list(map(lambda el: el.to_json(), playlists))
    app.semits.emit("playlists_refresh_response", list(map(lambda el: el.to_json(), playlists)))


# --------------------------------------------------------- SETTINGS CALLBACKS -------------------------------------------------------------------------------

# settings callbacks
@socketio.on("settings_save")
def settings_save(data, is_connect):
    settings_utils.save_settings(data)
    app.semits.show_toast_on_UI("Settings saved")
    
    if is_connect:
        app.logger.info("Connecting device")
        
        app.feeder.connect()
        if app.feeder.is_connected():
            app.semits.show_toast_on_UI("Connection to device successful")
        else:
            app.semits.show_toast_on_UI("Device not connected. Opening a fake serial port.")


@socketio.on("settings_request")
def settings_request():
    settings = settings_utils.load_settings()
    settings["serial"]["available_baudrates"] = ["2400", "4800", "9600", "19200", "38400", "57600", "115200", "230400", "460800", "921600"]
    settings["serial"]["available_ports"] = app.feeder.serial_ports_list()
    settings["serial"]["available_ports"].append("FAKE")
    app.semits.emit("settings_now", json.dumps(settings))


@socketio.on("send_gcode_command")
def send_gcode_command(command):
    app.feeder.send_gcode_command(command)

# --------------------------------------------------------- DRAWINGS CALLBACKS -------------------------------------------------------------------------------

@socketio.on("drawing_queue")
def drawing_queue(code):
    app.qmanager.queue_drawing(code)

@socketio.on("drawing_delete")
def drawing_delete(code):
    item = db.session.query(UploadedFiles).filter_by(id=code).first()
    # TODO should delete the drawing also from every playlist
    
    try:
        if not item is None:
            db.session.delete(item)
            db.session.commit()
            shutil.rmtree(app.config["UPLOAD_FOLDER"] +"/" + str(code) +"/")
            app.logger.info("Drawing code {} deleted".format(code))
            app.semits.show_toast_on_UI("Drawing deleted")
    except Exception as e:
        app.logger.error("'Delete drawing code {}' error".format(code))

@socketio.on("drawings_refresh")
def drawings_refresh():
    rows = db.session.query(UploadedFiles).order_by(UploadedFiles.edit_date.desc())
    res = []
    for r in rows:
        res.append({"id": r.id, "filename": r.filename})
    app.semits.emit("drawings_refresh_response", json.dumps(res))


# --------------------------------------------------------- QUEUE CALLBACKS -------------------------------------------------------------------------------

@socketio.on("queue_get_status")
def queue_get_status():
    app.qmanager.send_queue_status()