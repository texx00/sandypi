from UIserver import socketio, app, db
from flask import render_template
from UIserver.database import UploadedFiles
import pickle

def show_message_on_UI(message):
    socketio.emit("message_container", message)

@socketio.on('connect')
def on_connect():
    #app.logger.info("Connected")
    pass


# frontend callbacks

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
    

# NCFeeder callbacks

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