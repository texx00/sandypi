
from UIserver.views.drawings_management import create_playlist, playlist, delete_playlist
from UIserver.sockets_interface.socketio_callbacks import playlist_save, playlist_add_element
from UIserver import db


def test_create_playlist(client):

    res = client.get('/create_playlist')
    
    assert res.default_status == 200
    assert res.location == "http://localhost/playlist/1"


def test_add_to_playlist(client):
    pass
