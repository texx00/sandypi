from datetime import datetime
import json

from sqlalchemy.sql import func

from server import db


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

    @classmethod
    def get_full_drawings_list(cls):
        return db.session.query(UploadedFiles).order_by(UploadedFiles.edit_date.desc()).all()
    
    @classmethod
    def get_random_drawing(cls):
        return db.session.query(UploadedFiles).order_by(func.random()).first()
        #return db.session.query(UploadedFiles).options(load_only('id')).offset(func.floor(func.random()*db.session.query(func.count(UploadedFiles.id)))).limit(1).all()


# move these imports here to avoid circular import in the GenericPlaylistElement
from server.database.playlist_elements_tables import create_playlist_table, delete_playlist_table, get_playlist_table_class
from server.database.playlist_elements import GenericPlaylistElement

# Playlist table
# Keep track of all the playlists
class Playlists(db.Model):
    id = db.Column(db.Integer, primary_key=True)                                # id of the playlist
    name = db.Column(db.String(80), unique=False, nullable=False, default="New playlist")
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) # Creation timestamp
    edit_date = db.Column(db.DateTime, default=datetime.utcnow)                 # Last time the playlist was edited (to update: datetime.datetime.utcnow())
    version = db.Column(db.Integer, default=0)                  # Incremental version number: +1 every time the playlist is saved
           
    def save(self):
        self.edit_date = datetime.utcnow()
        self.version += 1
        db.session.commit()

    def add_element(self, elements):
        if isinstance(elements, str):
            elements = json.loads(elements)
        if not isinstance(elements, list):
            elements = [elements]
        for i in elements:
            if "id" in i:   # delete old ids to mantain the new sorting scheme (the elements list should be already ordered, for this reason we clear the elements and add them in the right order)
                del i["id"]
            if not isinstance(i, GenericPlaylistElement):
                i = GenericPlaylistElement.create_element_from_dict(i)
            i.save(self._ec())
        db.session.commit()
    
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

    def to_json(self):
        return json.dumps({
            "name": self.name,
            "elements": self.get_elements_json(),
            "id": self.id,
            "version": self.version
        })

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
        try:
            return db.session.query(Playlists).filter(Playlists.id==id).one()       # todo check if there is at leas one line (if the playlist exist)
        except:
            return Playlists.create_playlist()

    @classmethod
    def delete_playlist(cls, id):
        item = db.session.query(Playlists).filter_by(id=id).first()
        db.session.delete(item)
        db.session.commit()
        delete_playlist_table(id)

    

# The app is using Flask-migrate
# When a modification is applied to the db structure (new table, table structure modification like column name change, new column etc.)
# must use the "flask db migrate" command (with the active environment) (can also use "flask db migrate -m 'Migrate changes message'" to add a description for the migration operation)
# The command will create a new version for the db and will apply the changes automatically when the latest version of the repo is loaded
# with "flask db upgrade" (this command is called automatically during "python setup.py install/develop")
# When testing may get multiple revisions for the same commit. Can merge multiple revisions with "flask db merge <revisions>"
