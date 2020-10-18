import os
import tempfile
from flask_sqlalchemy import SQLAlchemy

import pytest

from UIserver import UIserver

# to run tests use "python -m pytest UIserver/tests" in the main project folder
# at the moment there is a deprecation waring related to the "future" library


@pytest.fixture
def client():
    db_fd, UIserver.app.config['SQLALCHEMY_DATABASE_URI'] = tempfile.mkstemp()
    UIserver.app.config['TESTING'] = True

    with UIserver.app.test_client() as client:
        with UIserver.app.app_context():
            UIserver.db = SQLAlchemy(UIserver.app)
        yield client

    os.close(db_fd)
    os.unlink(UIserver.app.config['SQLALCHEMY_DATABASE_URI'])

def test_empty_database(client):
    """Start with a blank database."""

    rv = client.get('/')
    assert rv.location == 'http://localhost/preview'
    assert rv.default_status == 200