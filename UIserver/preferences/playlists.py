from UIserver import app
from flask import render_template, request
from werkzeug.utils import secure_filename

import os


ALLOWED_EXTENSIONS = ["gcode", "nc"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/playlists', methods=['GET','POST'])
def playlists():
    if request.method == "POST":
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename!= '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
                return render_template("preferences/uploaded.html", success=True)
            else: 
                return render_template("preferences/uploaded.html", success=False)
            
    return render_template("preferences/playlists.html")
