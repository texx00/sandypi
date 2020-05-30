from UIserver import app, socketio

# This method send a "start" command to the bot with the code of the drawing
def start_drawing(code):
    app.logger.info("Sending gcode start command")
    socketio.emit('bot_start', str(code))

def queue_drawing(code):
    app.logger.info("Sending queue command")
    socketio.emit('bot_queue', str(code))