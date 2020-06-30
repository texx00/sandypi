from UIserver import app, socketio
from flask import render_template
import os.path
import shutil
import json

@app.route("/settings", methods=['GET','POST'])
def settings_page():
    if(not os.path.exists(app.config['SAVED_SETTINGS'])):
        shutil.copyfile("UIserver/saves/default_settings.json", app.config['SAVED_SETTINGS'])
    settings = ""
    with open(app.config['SAVED_SETTINGS']) as f:
        settings = json.load(f) 
    serial = {}
    serial["baudrates"] = ["2400", "4800", "9600", "19200", "38400", "57600", "115200", "230400", "460800", "921600"]
    serial["baud"] = settings['serial']['baud']  # TODO load the last saved
    serial["port"] = settings['serial']['port']  # TODO load the last saved
    socketio.emit("serial_port_list_request")
    return render_template("settings.html", serial = serial)