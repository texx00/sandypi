from UIserver import socketio, app
from UIserver.bot_interface import bot_commands as bot

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
        bot.start_drawing(res[1])
    if res[0]=="queue":
        bot.queue_drawing(res[1])

# NCFeeder callbacks

@socketio.on('drawing_ended')
def on_drawing_ended():
    app.logger.info("B> Drawing ended")
    show_message_on_UI("Drawing ended")

@socketio.on('drawing_started')
def on_drawing_ended():
    app.logger.info("B> Drawing started")
    show_message_on_UI("Drawing started")

@socketio.on('server_command')
def on_server_command(command):
    app.logger.info("Command received from bot")