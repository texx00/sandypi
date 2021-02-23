from server.utils import settings_utils
from server import app, db
from server.database.models import UploadedFiles
from flask import request, jsonify
from werkzeug.utils import secure_filename
from server.utils.gcode_converter import ImageFactory

import traceback

import os
import shutil

ALLOWED_EXTENSIONS = ["gcode", "nc", "thr"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Upload route for the dropzone to load new drawings
@app.route('/api/upload/', methods=['GET','POST'])
def api_upload():
    if request.method == "POST":
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename!= '' and allowed_file(file.filename):
                # TODO add support to thr files
                settings = settings_utils.load_settings()
                # TODO move this into a thread because on the pi0w it is too slow and some drawings are not loaded in time
                filename = secure_filename(file.filename)
                new_file = UploadedFiles(filename = filename)
                db.session.add(new_file)
                db.session.commit()
                factory = ImageFactory(settings_utils.get_only_values(settings["device"]))
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
                        image = factory.gcode_to_image(file)
                        image.save(os.path.join(folder, str(new_file.id)+".jpg"))
                except:
                    app.logger.error("Error during image creation")
                    app.logger.error(traceback.print_exc())
                    shutil.copy2(app.config["UPLOAD_FOLDER"]+"/placeholder.jpg", os.path.join(folder, str(new_file.id)+".jpg"))
                    # TODO create a better placeholder? or add a routine to fix missing images?

                app.logger.info("File added")
                return jsonify(new_file.id)
    return jsonify(-1)
