
from UIserver.views.drawings_management import create_playlist, playlist, delete_playlist
from UIserver.sockets_interface.socketio_callbacks import playlist_save, playlist_add_element
from UIserver import db


def test_create_playlist(client):

    res = client.get('/create/playlist')
    
    assert res.default_status == 200
    assert res.location == "http://localhost/playlist/1"

    res = client.get('/create/playlist')

    assert res.default_status == 200

    res = client.get("/playlist/1")

    assert res.default_status == 200


def test_add_to_playlist(client):
    #TODO
    pass


def test_save_playlist(client):
    #TODO
    pass


def test_delete_playlist(client):
    res = client.get('/delete/playlist/1')

    assert res.default_status == 200
    assert res.location == "http://localhost/preview"


def test_check_missing_playlist(client):
    res = client.get("/playlist/10")

    assert res.default_status == 200
    assert "Playlist not found" in res.data.decode(encoding="UTF-8")

