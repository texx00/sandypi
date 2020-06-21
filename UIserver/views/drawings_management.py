from UIserver import app, socketio, db
from UIserver.database import UploadedFiles, Playlists
from flask import render_template, request, url_for, redirect
from werkzeug.utils import secure_filename
from UIserver.views.utils.gcode_converter import gcode_to_image
import traceback

import os
import logging
import shutil

ALLOWED_EXTENSIONS = ["gcode", "nc"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/preview')
def preview():
    result = db.session.query(UploadedFiles).order_by(UploadedFiles.edit_date.desc()).limit(4)
    pl_result = db.session.query(Playlists).order_by(Playlists.edit_date.desc())
    return render_template("management/grid_element.html", drawings = result, parent_template = "management/preview.html", playlists = pl_result)

# Upload route for the dropzone to load new drawings
@app.route('/upload', methods=['GET','POST'])
def upload():
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

                app.logger.info("File added")
                # TODO give a feedback to the user about the result of the operation
                return "1"
    return "0"

# ---- DRAWINGS ----

@app.route('/drawings')
def drawings():
    return drawings_page(1)

@app.route('/drawings/<page>')
def drawings_page(page):
    DRAWINGS_PER_PAGE = 20
    page = int(page)
    d_num = db.session.query(UploadedFiles).count()
    pages_num = int((d_num-1)/DRAWINGS_PER_PAGE)+1
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
    #app.logger.info(rows)
    return render_template("management/grid_element.html", drawings=rows, pages = pages, parent_template  = "management/drawings.html")

# Single drawing page
@app.route('/drawing/<code>')
def drawing(code):
    item = db.session.query(UploadedFiles).filter(UploadedFiles.id==code).one()
    app.logger.info("Is drawing: {}".format(app.qmanager.is_drawing()))
    playlists = db.session.query(Playlists)
    return render_template("management/single_drawing.html", item = item, isdrawing=app.qmanager.is_drawing(), playlists=playlists)

# Delete drawing
@app.route('/delete/drawing/<code>')
def delete_drawing(code):
    item = db.session.query(UploadedFiles).filter_by(id=code).first()
    try:
        db.session.delete(item)
        db.session.commit()
        os.rmdir(app.config["UPLOAD_FOLDER"] +"/" + str(code) +"/")
        app.logger.info("Drawing code {} deleted".format(code))
    except:
        app.logger.error("'Delete drawing code {}' error".format(code))
    return redirect(url_for('preview'))


# ---- PLAYLISTS ----

@app.route('/playlist/<code>')
def playlist(code):
    item = db.session.query(Playlists).filter_by(id=code).first()
    if not item.drawings=="":
        drawings = item.drawings.split(",")[0:-1]
    else: drawings = []
    return render_template("management/playlist.html", item=item, drawings=drawings)

@app.route('/create_playlist')
def create_playlist():
    item = Playlists()
    db.session.add(item)
    db.session.commit()
    return redirect(url_for("playlist", code=str(item.id)))


# Delete playlist
@app.route('/delete/playlist/<code>')
def delete_playlist(code):
    item = db.session.query(Playlists).filter_by(id=code).first()
    try:
        db.session.delete(item)
        db.session.commit()
        app.logger.info("Playlist code {} deleted".format(code))
    except:
        app.logger.error("'Delete playlist code {}' error".format(code))
    return redirect(url_for('preview'))

# ---- QUEUE ----

# Show queue
@app.route('/queue')
def show_queue():
    socketio.emit("bot_status")
    return render_template("management/queue.html")