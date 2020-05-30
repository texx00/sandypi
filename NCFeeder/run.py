import socketio_interface
import socketio
from feeder import Feeder

fed = Feeder()

# Start the socketio communication with the server
socketio_interface.init(fed)

# Wait for any event
while True:
    pass