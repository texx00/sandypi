from flask import render_template

import pickle
import json
import datetime

from UIserver import socketio, app, db

from UIserver.utils import settings_utils, software_updates
from UIserver.database.models import Playlists
from UIserver.database.playlist_elements import DrawingElement
from UIserver.database.models import UploadedFiles, Playlists


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
    
# playlist sockets
# save the changes to the playlist
@socketio.on("playlist_save")
def playlist_save(playlist):
    playlist = json.loads(playlist)
    pl = Playlists.get_playlist(playlist['id'])
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
@socketio.on("start_playlist")
def start_playlist(code):
    item = db.session.query(Playlists).filter(Playlists.id==code).one()
    for i in item.elements.replace(" ", "").split(","):
        if i != "":
            app.qmanager.queue_drawing(i)

# settings callbacks
@socketio.on("save_settings")
def save_settings(data, is_connect):
    settings_utils.save_settings(data)
    app.semits.show_toast_on_UI("Settings saved")
    
    if is_connect:
        app.logger.info("Connecting device")
        
        app.feeder.connect()
        if app.feeder.is_connected():
            app.semits.show_toast_on_UI("Connection to device successful")
        else:
            app.semits.show_toast_on_UI("Device not connected. Opening a fake serial port.")

@socketio.on("send_gcode_command")
def send_gcode_command(command):
    app.feeder.send_gcode_command(command)
