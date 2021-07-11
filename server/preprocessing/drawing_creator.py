from server.utils import settings_utils
from server import app, db
from server.database.models import IdsSequences, UploadedFiles
from werkzeug.utils import secure_filename
from server.utils.gcode_converter import ImageFactory

import traceback
import json

import os
import shutil

def preprocess_drawing(filename, file):

    # TODO add support to thr files
    settings = settings_utils.load_settings()
    # TODO move this into a thread because on the pi0w it is too slow and some drawings are not loaded in time
    filename = secure_filename(filename)

    # this workaround fixes issue #40. Should fix it through the UploadFiles model with the primary key autoincrement but at the moment it is not working
    id = IdsSequences.get_incremented_id(UploadedFiles)
    
    new_file = UploadedFiles(id = id, filename = filename)
    db.session.add(new_file)
    db.session.commit()
    factory = ImageFactory(settings_utils.get_only_values(settings["device"]))
    # create a folder for each drawing. The folder will contain the .gcode file, the preview and additionally some settings for the drawing
    folder = app.config["UPLOAD_FOLDER"] +"/" + str(new_file.id) +"/"
    try:
        os.mkdir(folder)
    except:
        app.logger.error("The folder for '{}' already exists".format(new_file.id))
    if hasattr(file, "save"):
        file.save(os.path.join(folder, str(new_file.id)+".gcode"))
    else:
        with open(os.path.join(folder, str(new_file.id)+".gcode"), "w") as f:
            for l in file.readlines():
                f.write(l)
    # create the preview image
    try:
        with open(os.path.join(folder, str(new_file.id)+".gcode")) as file:
            dimensions, coords = factory.gcode_to_coords(file)
            image = factory.draw_image(coords, dimensions)
            # saving the new image
            image.save(os.path.join(folder, str(new_file.id)+".jpg"))
        
        # saving additional information
        new_file.path_length = dimensions["total_lenght"]
        del dimensions["total_lenght"]
        new_file.dimensions_info = json.dumps(dimensions)
        db.session.commit()
    except:
        app.logger.error("Error during image creation")
        app.logger.error(traceback.print_exc())
        shutil.copy2(app.config["UPLOAD_FOLDER"]+"/placeholder.jpg", os.path.join(folder, str(new_file.id)+".jpg"))
        # TODO create a better placeholder? or add a routine to fix missing images?

    app.logger.info("File added")

    return new_file.id