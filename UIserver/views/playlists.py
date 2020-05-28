from UIserver import app, db
from UIserver.database import UploadedFiles
from flask import render_template, request
from werkzeug.utils import secure_filename

import os
import logging

ALLOWED_EXTENSIONS = ["gcode", "nc"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/playlists')
def playlists():
    return render_template("preferences/playlists.html")

@app.route('/upload', methods=['GET','POST'])
def upload():
    if request.method == "POST":
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename!= '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                new_file = UploadedFiles(filename = filename)
                db.session.add(new_file)
                db.session.commit()
                file.save(os.path.join(app.config["UPLOAD_FOLDER"], str(new_file.id)+".gcode"))
                app.logger.info("File added")
                #TODO response success
                return "1"
            else: 
                #TODO response error
                return "0"
    return "0"