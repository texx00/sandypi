import json
import shutil
import os

from server import socketio, app, db

from server.utils import settings_utils, software_updates
from server.database.models import Playlists
from server.database.playlist_elements import DrawingElement, GenericPlaylistElement
from server.database.models import UploadedFiles, Playlists

# request to check if a new version of the software is available 
@socketio.on('software_updates_check')
def handle_software_updates_check():
    result = software_updates.compare_local_remote_tags()
    if result:
        if result["behind_remote"]:
            toast = """A new update is available ({0})\n
            Your version is {1}\n
            Check the github page to update to the latest version.
            """.format(result["remote_latest"], result["local"])
            socketio.emit("software_updates_response", toast)


# TODO split in multiple files?    

# --------------------------------------------------------- PLAYLISTS CALLBACKS -------------------------------------------------------------------------------

# delete a playlist
@socketio.on("playlist_delete")
def playlist_delete(id):
    try:
        Playlists.delete_playlist(id)
        app.logger.info("Playlist code {} deleted".format(id))
    except Exception as e:
        app.logger.error("'Delete playlist code {}' error".format(id))
    playlist_refresh()

# save the changes to the playlist
@socketio.on("playlist_save")
def playlist_save(playlist):
    playlist = json.loads(playlist)
    pl = Playlists.create_playlist() if not "id" in playlist else Playlists.get_playlist(playlist['id'])
    pl.clear_elements()
    pl.name = playlist['name']
    pl.add_element(playlist['elements'])
    pl.save()
    playlist_refresh()

# adds a playlist to the drawings queue
@socketio.on("playlist_queue")
def playlist_queue(code):
    item = db.session.query(Playlists).filter(Playlists.id==code).one()
    elements = item.get_elements()
    for i in elements:
        app.qmanager.queue_element(i, show_toast = False)

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
    settings = settings_utils.load_settings()
    app.leds_controller.update_settings(settings)
    app.semits.show_toast_on_UI("Settings saved")

    # updating feeder
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

@socketio.on("settings_shutdown_system")
def settings_shutdown_system():
    app.semits.show_toast_on_UI("Shutting down the device")
    os.system("sudo shutdown now")

@socketio.on("settings_reboot_system")
def settings_reboot_system():
    app.semits.show_toast_on_UI("Rebooting system...")
    os.system("sudo reboot")

# --------------------------------------------------------- DRAWINGS CALLBACKS -------------------------------------------------------------------------------

@socketio.on("drawing_queue")
def drawing_queue(code):
    element = DrawingElement(drawing_id=code)
    app.qmanager.queue_element(element)

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

@socketio.on("queue_set_order")
def queue_set_order(elements):
    app.qmanager.set_new_order(map(lambda e: GenericPlaylistElement.create_element_from_dict(e), json.loads(elements)))

@socketio.on("queue_stop_drawing")
def queue_stop_drawing():
    app.semits.show_toast_on_UI("Stopping drawing...") 
    app.qmanager.stop_drawing()
    if not app.qmanager.is_drawing():   # if the drawing was the last in the queue must send the updated status
        app.qmanager.send_queue_status()

# --------------------------------------------------------- LEDS CALLBACKS -------------------------------------------------------------------------------

@socketio.on("leds_set_color")
def leds_set_color(data):
    color = json.loads(data)
    app.leds_controller.set_color((color["r"], color["g"], color["b"]))
