
def test_index(client):
    rv = client.get('/')

    assert rv.location == 'http://localhost/preview'
    assert rv.default_status == 200
