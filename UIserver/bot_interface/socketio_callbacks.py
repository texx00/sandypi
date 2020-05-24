from UIserver import socketio

from flask_socketio import emit

@socketio.on('message')
def handle_message(message):
    print('received message: ' + str(message))
    emit('response', "Prova")