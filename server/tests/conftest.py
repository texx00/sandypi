import os
import tempfile

import concurrent.futures as cf

from flask_sqlalchemy import SQLAlchemy
import flask_migrate

import pytest

from server import server
from server import db

# to run tests use "python -m pytest server/tests" in the main project folder
# at the moment there is a deprecation waring related to the "future" library


@pytest.fixture(scope="session")
def client():
    db_fd, db_fu = tempfile.mkstemp()
    server.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
    server.app.config['TESTING'] = True

    with server.app.test_client() as client:
        with server.app.app_context():
            db.create_all() 
            yield client
            db.drop_all()

    os.close(db_fd)
    os.unlink(db_fu)


