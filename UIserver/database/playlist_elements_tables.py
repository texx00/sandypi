from sqlalchemy.ext.declarative import declarative_base
from UIserver import db

# creates base class with common methods
class PlaylistElements(object):
    @classmethod
    def get_playlist_elements(cls):
        if cls == PlaylistElements:
            raise NotImplementedError("Must use a table class to query the elements")
        return cls.query.all()

    @classmethod
    def clear_elements(cls):
        if cls == PlaylistElements:
            raise NotImplementedError("Must use a table class to clean the table")
        res = db.session.query(cls).delete()
        db.session.commit()
        return res

# creates sqlalchemy base class with the addition of the custom class
Base = declarative_base(cls = PlaylistElements)
Base.query = db.session.query_property()


def get_playlist_table_class(id):
    # may be better to use reflection methods from sql alchemy here after the table has been created?
    if id is None: raise ValueError("A playlist id must be specified")
    table_name = "_playlist_{}".format(id)

    class PTable(Base):
        """
        These tables are not updated automatically with flask migrate.
        If a schema change is applied to this tables must use a custom migrate script for the upgrade to a new database version
        """
        __tablename__ = table_name
        __table_args__ = {'extend_existing': True}                      # necessary to modify a table
        id = db.Column(db.Integer, primary_key=True)
        element_type = db.Column(db.String(10), default="")
        drawing_id = db.Column(db.Integer, default = None)              # drawing id added explicitely for possible queries
        element_options = db.Column(db.String(1000), default="")        # element options

    return PTable

def create_playlist_table(id):
    """
    Create a table associated to a single playlist.
    The number of tables will be the same as the number of playlists.
    """
    p_class = get_playlist_table_class(id)
    p_class.__table__.create(db.get_engine())