from UIserver import socketio, app
from UIserver.bot_interface import bot_commands as bot

@socketio.on('message')
def handle_message(message):
    app.logger.info("Received message from js")
    res = message['data'].split(":")
    if res[0]=="start":
        bot.start_drawing(res[1])
    if res[0]=="queue":
        bot.queue_drawing(res[1])

@socketio.on('connect')
def on_connect():
    #app.logger.info("Connected")
    pass

@socketio.on('server_command')
def on_server_command(command):
    app.logger.info("Command received from bot")