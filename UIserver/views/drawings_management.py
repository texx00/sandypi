from UIserver import app, db
from UIserver.database import UploadedFiles
from flask import render_template, request, url_for
from werkzeug.utils import secure_filename
from UIserver.views.utils.gcode_converter import gcode_to_image
import traceback

import os
import logging
import shutil

ALLOWED_EXTENSIONS = ["gcode", "nc"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/playlists')
def playlists():
    result = db.session.query(UploadedFiles).order_by(UploadedFiles.edit_date.desc()).limit(4)
    return render_template("management/preview.html", drawings=result)

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
                # create the preview image
                try:
                    with open(os.path.join(folder, str(new_file.id)+".gcode")) as file:
                        image = gcode_to_image(file)
                        image.save(os.path.join(folder, str(new_file.id)+".jpg"))
                except:
                    app.logger.error("Error during image creation")
                    app.logger.error(traceback.print_exc())
                    shutil.copy2(app.config["UPLOAD_FOLDER"]+"/placeholder.jpg", os.path.join(folder, str(new_file.id)+".jpg"))

                app.logger.info("File added")
                # TODO give a feedback to the user about the result of the operation
                return "1"
    return "0"


@app.route('/drawings')
def drawings():
    return drawings_page(1)

@app.route('/drawings/<page>')
def drawings_page(page):
    DRAWINGS_PER_PAGE = 20
    page = int(page)
    d_num = db.session.query(UploadedFiles).count()
    pages_num = int(d_num/DRAWINGS_PER_PAGE)+1
    if page > pages_num:
        page = pages_num
    if page < 1:
        page = 1
    
    rows = db.session.query(UploadedFiles).order_by(UploadedFiles.edit_date.desc()).limit(str(DRAWINGS_PER_PAGE)).offset(str(DRAWINGS_PER_PAGE*(page-1)))
    if page == pages_num:
        limit = d_num - DRAWINGS_PER_PAGE*(pages_num-1)
    else: limit = DRAWINGS_PER_PAGE

    pages = {
        "this": page,
        "next": page+1,
        "prev": page-1,
        "total": pages_num,
        "limit": limit,
        'drawings': d_num
    }
    app.logger.info(rows)
    return render_template("management/drawings.html", drawings=rows, pages = pages)


# Single drawing page
@app.route('/drawing/<code>')
def drawing(code):
    item = db.session.query(UploadedFiles).filter(UploadedFiles.id==code).one()
    return render_template("management/single_drawing.html", item = item)
