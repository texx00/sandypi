import json
import shutil
import os
from os.path import dirname
import platform

from server import socketio, app, db

from server.utils import settings_utils, software_updates
from server.database.models import Playlists
from server.database.playlist_elements import DrawingElement, GenericPlaylistElement
from server.database.models import UploadedFiles, Playlists

@socketio.on('connect')
def on_client_connected():
    app.qmanager.send_queue_status()        # sending queue status
    settings_request()                      # sending updated settings

# TODO split in multiple files?    


# --------------------------------------------------------------- UPDATES -------------------------------------------------------------------------------------

# request to check if a new version of the software is available 
@socketio.on('software_updates_check')
def updates_check():
    if software_updates.get_branch_name() == "master":
        result = software_updates.compare_local_remote_tags()
        if result:
            if result["behind_remote"]:
                toast = """A new update is available ({0})\n
                Your version is {1}\n
                Check the settings tab to upgrade the software""".format(result["remote_latest"], result["local"])
                socketio.emit("software_updates_response", toast)
    else:
        if software_updates.get_update_available():
            toast = """A new update is available\n
                Check the settings tab to upgrade the software"""
            socketio.emit("software_updtates_response", toast)

@socketio.on("software_run_update")
def updates_run_update():
    folder = dirname(dirname(dirname(os.path.realpath(__file__))))              # must get the main folder path to create the hidden file
    if platform.system() == "Windows":
        f = open("{}\\run_update.txt".format(folder), "w")
        f.write(".")
        f.close()
        app.semits.show_toast_on_UI("Restart the server to apply the update")
    else:
        os.system("touch {}/run_update.txt".format(folder))
        os.system("reboot now")

@socketio.on("software_change_branch")
def updates_run_update(branch):
    software_updates.switch_to_branch(branch.lower())
    updates_run_update()

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
    pl = Playlists.create_playlist() if ((not "id" in playlist) or (playlist["id"] == 0)) else Playlists.get_playlist(playlist['id'])
    pl.clear_elements()
    pl.name = playlist['name']
    pl.add_element(playlist['elements'])
    pl.save()
    app.logger.info("Playlist saved")
    playlist_refresh_single(pl.id)


# adds a playlist to the drawings queue
@socketio.on("playlist_queue")
def playlist_queue(code):
    item = db.session.query(Playlists).filter(Playlists.id==code).one()
    elements = item.get_elements()
    for i in elements:
        app.qmanager.queue_element(i, show_toast = False)


@socketio.on("playlist_create_new")
def playlist_create_new():
    pl = Playlists.create_playlist()
    pl.name = "New playlist"
    pl.save()
    app.semits.emit("playlist_create_id", pl.to_json())


@socketio.on("playlists_refresh")
def playlist_refresh():
    playlists = db.session.query(Playlists).order_by(Playlists.edit_date.desc()).all()
    app.semits.emit("playlists_refresh_response", list(map(lambda el: el.to_json(), playlists)))


@socketio.on("playlist_refresh_single")
def playlist_refresh_single(playlist_id):
    playlist = db.session.query(Playlists).filter(Playlists.id == playlist_id).first()
    app.semits.emit("playlists_refresh_single_response", playlist.to_json())

# --------------------------------------------------------- SETTINGS CALLBACKS -------------------------------------------------------------------------------

# settings callbacks
@socketio.on("settings_save")
def settings_save(data, is_connect):
    settings_utils.save_settings(data)
    settings = settings_utils.load_settings()
    app.feeder.update_settings(settings)
    app.bmanager.update_settings(settings)
    app.lmanager.update_settings(settings)
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
    settings["buttons"]["available_values"] =           app.bmanager.get_buttons_options()
    settings["buttons"]["available"] =                  app.bmanager.gpio_is_available()    or (not os.getenv("DEV_HWBUTTONS") is None)
    settings["leds"]["available"]["value"] =            app.lmanager.is_available()         or (not os.getenv("DEV_HWLEDS") is None)
    settings["leds"]["has_light_sensor"]["value"] =     app.lmanager.has_light_sensor()     or (not os.getenv("DEV_HWLEDS") is None)
    settings["serial"]["port"]["available_values"] =    app.feeder.serial_ports_list()
    settings["serial"]["port"]["available_values"].append("FAKE")
    settings["updates"]["hash"] =                       app.umanager.short_hash
    settings["updates"]["branch"] =                     app.umanager.branch
    settings["updates"]["update_available"] =           app.umanager.update_available
    tmp = []
    labels = [v["label"] for v in settings["buttons"]["available_values"]]
    for b in settings["buttons"]["buttons"]:
        b["click"]["available_values"] = labels
        b["press"]["available_values"] = labels
        tmp.append(b)
    settings["buttons"]["buttons"] = tmp
    app.semits.emit("settings_now", json.dumps(settings))

@socketio.on("send_gcode_command")
def send_gcode_command(command):
    app.feeder.send_gcode_command(command)

@socketio.on("settings_shutdown_system")
def settings_shutdown_system():
    app.semits.show_toast_on_UI("Shutting down the device")
    app.feeder.stop()
    app.lmanager.stop()
    os.system("shutdown now")

@socketio.on("settings_reboot_system")
def settings_reboot_system():
    app.semits.show_toast_on_UI("Rebooting system...")
    os.system("reboot now")

# --------------------------------------------------------- DRAWINGS CALLBACKS -------------------------------------------------------------------------------

@socketio.on("drawing_queue")
def drawing_queue(code):
    element = DrawingElement(drawing_id=code)
    app.qmanager.reset_play_random()
    app.qmanager.queue_element(element)

@socketio.on("drawing_pause")
def drawing_pause():
    app.qmanager.pause()

@socketio.on("drawing_resume")
def drawing_resume():
    app.qmanager.resume()

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
    if elements == "":
        app.qmanager.clear_queue()
    else:
        app.qmanager.set_new_order(map(lambda e: GenericPlaylistElement.create_element_from_dict(e), json.loads(elements)))

# stops only the current element
@socketio.on("queue_next_drawing")
def queue_next_drawing():
    app.semits.show_toast_on_UI("Stopping drawing...") 
    app.qmanager.start_next(force_stop=True)
    if not app.qmanager.is_drawing():   # if the drawing was the last in the queue must send the updated status
        app.qmanager.send_queue_status()

# clears the queue and stops the current element
@socketio.on("queue_stop_all")
def queue_stop_all():
    queue_set_repeat(False)
    queue_set_shuffle(False)
    queue_set_order("")
    app.qmanager.stop()

# sets the repeat flag for the queue
@socketio.on("queue_set_repeat")
def queue_set_repeat(val):
    app.qmanager.set_repeat(val)
    app.logger.info("repeat: {}".format(val))

# sets the shuffle flag for the queue
@socketio.on("queue_set_shuffle")
def queue_set_shuffle(val):
    app.qmanager.set_shuffle(val)
    app.logger.info("shuffle: {}".format(val))

# sets the queue interval
@socketio.on("queue_set_interval")
def queue_set_interval(val):
    app.qmanager.set_interval(float(val))
    app.logger.info("interval: {}".format(val))

# starts a random drawing from the uploaded list
@socketio.on("queue_start_random")
def queue_start_random():
    app.qmanager.start_random_drawing(repeat=False)

# --------------------------------------------------------- LEDS CALLBACKS -------------------------------------------------------------------------------

@socketio.on("leds_set_color")
def leds_set_color(color):
    app.lmanager.set_color(color) 

@socketio.on("leds_auto_dim")
def leds_set_autodim(val):
    # TODO add an "autodim" on in the settings
    if val:
        app.lmanager.sensor.start()
    else:
        app.lmanager.sensor.stop()

# --------------------------------------------------------- MANUAL CONTROL -------------------------------------------------------------------------------

@socketio.on("control_emergency_stop")
def control_emergency_stop():
    app.feeder.emergency_stop()