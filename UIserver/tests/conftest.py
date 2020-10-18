import os
import tempfile

import concurrent.futures as cf

from flask_sqlalchemy import SQLAlchemy
import flask_migrate

import pytest

from UIserver import UIserver
from UIserver import db

# to run tests use "python -m pytest UIserver/tests" in the main project folder
# at the moment there is a deprecation waring related to the "future" library


@pytest.fixture(scope="session")
def client():
    db_fd, db_fu = tempfile.mkstemp()
    UIserver.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
    UIserver.app.config['TESTING'] = True

    with UIserver.app.test_client() as client:
        with UIserver.app.app_context():
            db.create_all() 
            yield client
            db.drop_all()

    os.close(db_fd)
    os.unlink(db_fu)


