
def test_index(client):
    rv = client.get('/')

    assert rv.default_status == 200
