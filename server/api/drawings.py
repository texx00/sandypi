from flask import request, jsonify
from server import app
from server.preprocessing.drawing_creator import preprocess_drawing
from server.sockets_interface.socketio_callbacks import drawings_refresh

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
                # create entry in the database and preview image
                id = preprocess_drawing(file.filename, file)

                # refreshing list of drawings for all the clients
                drawings_refresh()
                return jsonify(id)
    return jsonify(-1)