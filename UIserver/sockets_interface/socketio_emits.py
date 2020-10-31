import traceback
from UIserver.database import UploadedFiles
from flask import render_template

class SocketioEmits():
    def __init__(self, app, socketio, db):
        self.app = app
        self.socketio = socketio
        self.db = db

    # shows a toast on the interface
    def show_toast_on_UI(self, message):
        self.emit("toast_show_message", message)


    # shows a line coming from the hw device on the manual control panel
    def hw_command_line_message(self, line):
        self.emit("command_line_show", line)


    # sends the last position to update the preview box
    def update_hw_preview(self, line):
        self.emit("preview_new_position", line)


    # updates the nav bar status preview
    def send_nav_drawing_status(self):
        if self.app.qmanager.is_drawing():
            try:
                item = self.db.session.query(UploadedFiles).filter(UploadedFiles.id == self.app.qmanager.get_code()).one()
                self.emit("current_drawing_preview", render_template("drawing_status.html", item=item))
            except Exception as e:
                self.app.logger.error("Error during nav drawing status update")
                self.emit("current_drawing_preview", "")
        else: 
            self.emit("current_drawing_preview", "")

    # general emit
    def emit(self, topic, line):
        self.socketio.emit(topic, line)