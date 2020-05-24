from UIserver import app
from flask import render_template

@app.route('/playlists')
def playlists():
    return render_template("preferences/playlists.html")