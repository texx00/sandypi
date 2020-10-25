from server import app, socketio, db
from server.database.models import UploadedFiles, Playlists
from flask import render_template, request, url_for, redirect
from werkzeug.utils import secure_filename
from server.utils.gcode_converter import gcode_to_image
from server.database.models import Playlists
from server.database.playlist_elements import DrawingElement

import traceback
import datetime

import os
import logging
import shutil
import json

ALLOWED_EXTENSIONS = ["gcode", "nc"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Upload route for the dropzone to load new drawings
@app.route('/api/upload/<playlist>', methods=['GET','POST'])
def api_upload(playlist):
    if request.method == "POST":
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename!= '' and allowed_file(file.filename):
                # TODO move this into a thread because on the pi0w it is too slow and some drawings are not loaded in time
                filename = secure_filename(file.filename)
                new_file = UploadedFiles(filename = filename)
                db.session.add(new_file)
                db.session.commit()
                # create a folder for each drawing. The folder will contain the .gcode file, the preview and additionally some settings for the drawing
                folder = app.config["UPLOAD_FOLDER"] +"/" + str(new_file.id) +"/"
                try:
                    os.mkdir(folder)
                except:
                    app.logger.error("The folder for '{}' already exists".format(new_file.id))
                file.save(os.path.join(folder, str(new_file.id)+".gcode"))
                # create the preview image
                try:
                    with open(os.path.join(folder, str(new_file.id)+".gcode")) as file:
                        image = gcode_to_image(file)
                        image.save(os.path.join(folder, str(new_file.id)+".jpg"))
                except:
                    app.logger.error("Error during image creation")
                    app.logger.error(traceback.print_exc())
                    shutil.copy2(app.config["UPLOAD_FOLDER"]+"/placeholder.jpg", os.path.join(folder, str(new_file.id)+".jpg"))

                playlist = int(playlist)
                if (playlist):
                    pl = Playlists.get_playlist(playlist)
                    pl.add_element(DrawingElement(new_file.id))
                    pl.save()

                app.logger.info("File added")
                return "1"
    return "0"


# return by default first 20 drawings
@app.route('/api/drawings/')
def api_drawings():
    return api_drawings_number(20)

# return the first n drawings
@app.route('/api/drawings/<number>')
def api_drawings_number(number):    
    rows = db.session.query(UploadedFiles).order_by(UploadedFiles.edit_date.desc()).limit(str(number))
    res = []
    for r in rows:
        res.append({"id": r.id, "filename": r.filename})
    return json.dumps(res)