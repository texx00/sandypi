from UIserver import app, socketio
from flask import render_template
import os.path
import shutil
import json
from utils import settings_utils
import os


@app.route("/manual_control", methods=['GET', 'POST'])
def manual_control():
    settings = settings_utils.load_settings()
    return render_template("preferences/manual_control.html", settings = settings)


@app.route("/settings", methods=['GET','POST'])
def settings_page():
    settings = settings_utils.load_settings()
    serial = {}
    serial["baudrates"] = ["2400", "4800", "9600", "19200", "38400", "57600", "115200", "230400", "460800", "921600"]
    serial["baud"] = settings['serial']['baud']  # TODO load the last saved
    serial["port"] = settings['serial']['port']  # TODO load the last saved
    socketio.emit("serial_port_list_request")
    return render_template("preferences/settings.html", serial = serial, settings = settings)

# Reboot the device
@app.route("/control/reboot", methods=['GET', 'POST'])
def reboot_device():
    try:
        return render_template("preferences/control/reboot.html")
    finally:
        os.system("sudo reboot")

# Shutdown the device
@app.route("/control/shutdown", methods=['GET', 'POST'])
def shutdown_device():
    try:
        return render_template("preferences/control/shutdown.html")
    finally:
        os.system("sudo shutdown now")