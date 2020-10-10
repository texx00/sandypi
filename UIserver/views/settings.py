from UIserver import app, socketio
from flask import render_template
import os.path
import shutil
import json
from UIserver.utils import settings_utils
import os
from time import sleep
from threading import Thread


@app.route("/manual_control", methods=['GET', 'POST'])
def manual_control():
    settings = settings_utils.load_settings()
    return render_template("preferences/manual_control.html", settings = settings)


@app.route("/settings", methods=['GET','POST'])
def settings_page():
    settings = settings_utils.load_settings()
    serial = {}
    serial["baudrates"] = ["2400", "4800", "9600", "19200", "38400", "57600", "115200", "230400", "460800", "921600"]
    serial["baud"] = settings['serial']['baud']  # load the last saved
    serial["port"] = settings['serial']['port']  # load the last saved
    serial["available_ports"] = app.feeder.serial_ports_list()
    serial["available_ports"].append("FAKE")
    return render_template("preferences/settings.html", serial = serial, settings = settings)

# Reboot the device
@app.route("/control/reboot", methods=['GET', 'POST'])
def reboot_device():
    th = Thread(target=delayed_os_command, args=("sudo reboot",))        # delaying reboot call
    th.start()
    return render_template("preferences/control/reboot.html")

# Shutdown the device
@app.route("/control/shutdown", methods=['GET', 'POST'])
def shutdown_device():
    th = Thread(target=delayed_os_command, args=("sudo shutdown now",))  # delaying shutdown call
    th.start()
    return render_template("preferences/control/shutdown.html")

def delayed_os_command(command):
    sleep(15)
    app.logger.info("Executing command: {}\n".format(command))
    os.system(command)