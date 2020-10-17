from sqlalchemy.ext.declarative import declarative_base
from UIserver import db

# creates base class with common methods
class PlaylistElements(object):
    @classmethod
    def get_playlist_elements(cls):
        pass

# creates sqlalchemy base class with the addition of the 
Base = declarative_base(cls = PlaylistElements)


def _get_playlist_table_class(id):
    if id is None: raise ValueError("A playlist id must be specified")
    table_name = "_playlist_{}".format(id)

    class PTable(Base):
        __tablename__ = table_name
        id = db.Column(db.Integer, primary_key=True)
        element_type = db.Column(db.String(10), default="")
        element_options = db.Column(db.String(1000), default="")

    return PTable

def create_playlist_table(id):
    p_class = _get_playlist_table_class(id)
    p_class.__table__.create(db.get_engine())
