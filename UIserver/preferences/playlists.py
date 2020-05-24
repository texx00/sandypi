from UIserver import app

@app.route('/playlists')
def playlists():
    return "Hello world!"