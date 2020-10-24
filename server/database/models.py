from server import db
from server.database.playlist_elements_tables import create_playlist_table, get_playlist_table_class
from server.database.playlist_elements import GenericPlaylistElement

from datetime import datetime
import os
import json

# Gcode files table
# Stores information about the single drawing
class UploadedFiles(db.Model):
    id = db.Column(db.Integer, primary_key=True)                                # drawing code
    filename = db.Column(db.String(80), unique=False, nullable=False)           # gcode filename
    up_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)   # Creation timestamp
    edit_date = db.Column(db.DateTime, default=datetime.utcnow)                 # last time the drawing was edited (to update: datetime.datetime.utcnow())
    last_drawn_date = db.Column(db.DateTime)                                    # last time the drawing was used by the table: to update: (datetime.datetime.utcnow())

    def __repr__(self):
        return '<User %r>' % self.filename

# Playlist table
# Keep track of all the playlists
class Playlists(db.Model):
    id = db.Column(db.Integer, primary_key=True)                                # id of the playlist
    name = db.Column(db.String(80), unique=False, nullable=False, default="New playlist")
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) # Creation timestamp
    edit_date = db.Column(db.DateTime, default=datetime.utcnow)                 # Last time the playlist was edited (to update: datetime.datetime.utcnow())
    active = db.Column(db.Boolean, default=False)                               # If the software should use this playlist or not when checking for rules
           
    def save(self):
        self.edit_date = datetime.utcnow()
        db.session.commit()

    def add_element(self, elements):
        if not isinstance(elements, list):
            elements = [elements]
        for i in elements:
            if not isinstance(i, GenericPlaylistElement):
                i = GenericPlaylistElement.create_element_from_dict(i)
            i.save(self._ec())
    
    def clear_elements(self):
        return self._ec().clear_elements()

    def get_elements(self):
        els = self._ec().get_playlist_elements()
        res = []
        for e in els:
            res.append(GenericPlaylistElement.create_element_from_db(e))
        return res
    
    def get_elements_json(self):
        els = self.get_elements()
        return json.dumps([e.get_dict() for e in els])

    # returns the database table class for the elements of that playlist
    def _ec(self):
        if not hasattr(self, "_tc"):
            self._tc = get_playlist_table_class(self.id)
        return self._tc
            
    @classmethod
    def create_playlist(cls):
        item = Playlists()
        db.session.add(item)
        db.session.commit()
        create_playlist_table(item.id)
        return item
    
    @classmethod
    def get_playlist(cls, id):
        if id is None:
            raise ValueError("An id is necessary to select a playlist")
        return db.session.query(Playlists).filter(Playlists.id==id).one()


    

# The app is using Flask-migrate
# When a modification is applied to the db structure (new table, table structure modification like column name change, new column etc.)
# must use the "flask db migrate" command (with the active environment)
# The command will create a new version for the db and will apply the changes automatically when the latest version of the repo is loaded
# with "flask db upgrade" (this command is called automatically during "python setup.py install/develop")
# When testing may get multiple revisions for the same commit. Can merge multiple revisions with "flask db merge <revisions>"
