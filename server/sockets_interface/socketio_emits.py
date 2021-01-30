
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

    # general emit
    def emit(self, topic, line):
        self.socketio.emit(topic, line)