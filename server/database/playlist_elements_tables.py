import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from server import db

# creates base class with common methods
class PlaylistElements(object):

    # returns the list of elements inside a playlist
    @classmethod
    def get_playlist_elements(cls):
        if cls == PlaylistElements:
            raise NotImplementedError("Must use a table class to query the elements")
        return cls.query.all()

    # clear all the elements inside a table
    @classmethod
    def clear_elements(cls):
        if cls == PlaylistElements:
            raise NotImplementedError("Must use a table class to clean the table")
        res = db.session.query(cls).delete()
        db.session.commit()
        return res
    
    # get random drawing element from the playlist (for the shuffle element)
    @classmethod
    def get_random_drawing_element(cls):
        return cls.query.filter(cls.drawing_id.isnot(None)).order_by(func.random()).first()

# creates sqlalchemy base class with the addition of the custom class
Base = declarative_base(cls = PlaylistElements)
Base.query = db.session.query_property()


def get_playlist_table_class(id):
    if id is None: raise ValueError("A playlist id must be specified")
    table_name = "_playlist_{}".format(id)                              # table name is prefix + table_id
    
    # if table exist use autoload otherwise create the table
    table_exist = table_name in sqlalchemy.inspect(db.engine).get_table_names()

    class PTable(Base):
        __tablename__ = table_name                                      # table name
        # set table args to load existing table if possible
        __table_args__ = {'extend_existing': True, 'autoload': table_exist, 'autoload_with': db.get_engine()}
        id = db.Column(db.Integer, primary_key=True)
        element_type = db.Column(db.String(10), default="")
        drawing_id = db.Column(db.Integer, default = None)              # drawing id added explicitely for possible queries
        element_options = db.Column(db.String(1000), default="")        # element options

    # change class attrs manually to avoid getting a warning ("This declarative base already contains a class with the same class name and module name")
    PTable.__name__ = table_name
    PTable.__qualname__ = table_name
    PTable.__module__ = table_name

    if not table_exist:
        PTable.__table__.create(db.get_engine())

    return PTable

def create_playlist_table(id):
    """
    Create a table associated to a single playlist.
    The number of tables will be the same as the number of playlists.
    """
    p_class = get_playlist_table_class(id)

def delete_playlist_table(id):
    """
    Delete a table associated to a single playlist.
    """
    p_class = get_playlist_table_class(id)
    p_class.__table__.drop(db.get_engine())