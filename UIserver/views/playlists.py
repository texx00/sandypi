from UIserver import app, db
from UIserver.database import UploadedFiles
from flask import render_template, request, url_for
from werkzeug.utils import secure_filename

import os
import logging
import shutil

ALLOWED_EXTENSIONS = ["gcode", "nc"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/playlists')
def playlists():
    result = db.session.query(UploadedFiles).order_by(UploadedFiles.edit_date.desc()).limit(4)
    return render_template("preferences/playlists.html", drawings=result)

# Upload route for the dropzone to load new drawings
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
                # create a folder for each drawing. The folder will contain the .gcode file, the preview and additionally some settings for the drawing
                folder = app.config["UPLOAD_FOLDER"] +"/" + str(new_file.id) +"/"
                os.mkdir(folder)
                file.save(os.path.join(folder, str(new_file.id)+".gcode"))
                # create a copy of a placeholder figure. TODO create the image from the gcode
                shutil.copy2(app.config["UPLOAD_FOLDER"]+"/placeholder.jpg", os.path.join(folder, str(new_file.id)+".jpg"))

                app.logger.info("File added")
                # TODO give a feedback to the user about the result of the operation
                return "1"
    return "0"