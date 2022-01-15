
"""
from gevent import monkey
monkey.patch_all()

import os
from geventwebsocket import WebSocketServer
from server import app

http_server = WebSocketServer(('0.0.0.0', 5000), app)
http_server.serve_forever()

"""
from server import app, socketio

if __name__ == "__main__":
    socketio.run(app)