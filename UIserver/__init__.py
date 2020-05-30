from flask import Flask, redirect, url_for
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
import os
import logging

app = Flask(__name__, template_folder='templates')
app.logger.setLevel(logging.INFO)

app.config['SECRET_KEY'] = 'secret!' # TODO put a key here
app.config['UPLOAD_FOLDER'] = "./UIserver/static/Drawings"
socketio = SocketIO(app)

file_path = os.path.abspath(os.getcwd())+"\database.db"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+file_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

import UIserver.database
import UIserver.views.drawings_management
import UIserver.bot_interface.socketio_callbacks

@app.route('/')
def home():
    return redirect(url_for('preview'))

if __name__ == '__main__':
    socketio.run(app)
