import socketio

sio = socketio.Client()

sio.connect('http://localhost:5000')

print("Connected")


@sio.on('response')
def response(response):
    print("Response: " +  response)
    sio.disconnect()

sio.emit('message', {'foo': 'bar'})
