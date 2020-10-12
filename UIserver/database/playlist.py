from UIserver import db, app
from UIserver.database.models import Playlists
import datetime
import json


class Playlist():
    def __init__(self, id=None):
        if id is None:
            item = Playlists()
            db.session.add(item)
            db.session.commit()
            self.id = item.id
            self.db_item = item
        else:
            self.id = id
            self.db_item = db.session.query(Playlists).filter(Playlists.id==id).one()        # TODO check that a playlist has been found
        self.name = self.db_item.name
        self.elements = self.db_item.elements
        
    def save(self):
        self.db_item.name = self.name
        self.db_item.edit_date = datetime.datetime.utcnow()
        self.db_item.elements = str(self.elements)
        db.session.commit()

    def add_single_element(self, element):
        self.elements += ", " + str(element)
    
    def add_elements(self, elements):
        self.elements = elements
    
    def clear_elements(self):
        self.elements = ""
            
    