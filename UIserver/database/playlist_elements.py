import json
from abc import abstractclassmethod

from UIserver.database.playlist_elements_tables import PlaylistElements, get_playlist_table_class
from UIserver import db


"""
    Base class for a playlist element
"""
class GenericPlaylistElement():
    element_type = None
    
    def __init__(self, element_type, **kwargs):
        self.element_type = element_type
        for v in kwargs:
            setattr(self, v, kwargs[v])
    
    def get_dict(self):
        return {key:value for key, value in self.__dict__.items() if not key.startswith('_') and not callable(key)}

    def __str__(self):
        return json.dumps(self.get_dict())

    def _set_from_dict(self, values):
        for k in values:
            if hasattr("set_{}".format(k)):
                pass
            elif hasattr(k):
                setattr(self, k, values[k])
            else:
                raise ValueError
    
    def save(self, element_table):
        options = self.get_dict()
        options.pop("element_type")
        options = json.dumps(options)
        element_table(element_type=self.element_type, element_options = options)


    @classmethod
    def create_element_from_dict(cls, dict_val):
        el_type = dict_val.pop("element_type")      # remove element type. Should be already be choosen when using the class
        for elementClass in GenericPlaylistElement._child_types:
            if elementClass.element_type == el_type:
                return elementClass.create_element_from_dict(dict_val)
        raise ValueError("'element_type' doesn't match any known element type")

    @classmethod
    def create_element_from_json(cls, json_str):
        dict_val = json.loads(json_str)
        return cls.create_element_from_dict(dict_val)

    @classmethod
    def create_element_from_db(cls, item):
        if not isinstance(item, PlaylistElements):
            raise ValueError("Need a db item from a playlist elements table")
        
        res = item.__dict__
        tmp = res.pop["element_options"]
        res = {**res, **json.loads(tmp)}
        return cls.create_element_from_dict(res)



"""
    Identifies a drawing in the playlist
"""
class DrawingElement(GenericPlaylistElement):
    def __init__(self, drawing_id=None, **kwargs):
        super().__init__("drawing", **kwargs)         # define the element type
        try:
            drawing_id = int(drawing_id)
            self.drawing_id = drawing_id
        except:
            raise ValueError("The drawing code must be an integer")
            self.drawing_id = None
    
    def save(self, element_table):
        options = self.get_dict()
        options.pop("element_type")
        options.pop("drawing_id")
        options = json.dumps(options)
        db.session.add(element_table(element_type=self.element_type, drawing_id = self.drawing_id, element_options = options))



"""
    Identifies a timing element (delay between drawings, next drawing at specific time of the day, repetitions, etc)
"""
class TimeElement(GenericPlaylistElement):
    def __init__(self, delay=None, expiry_date=None):
        super().__init__("timing")
        non_none = sum(i is not None for i in [delay, expiry_date])
        if non_none != 1:
            if non_none == 0:
                raise ValueError("At least one value must be specify: delay or expiry_date")
            else:
                raise ValueError("Only one of the arguments can be specified at a time")
        self.delay = delay
        self.expiry_date = expiry_date


"""
    Identifies a command element (sends a specific command/list of commands to the board)
"""
class CommandElement(GenericPlaylistElement):
    def __init__(self, command):
        super().__init__("command")

"""
    Identifies a particular behaviour for the ball between drawings (like: move to the closest border, start from the center)
"""
class PositioningElement(GenericPlaylistElement):
    def __init__(self):
        super().__init__("positioning")

"""
    Identifies a "clear all" pattern
"""
class ClearElement(GenericPlaylistElement):
    def __init__(self):
        super().__init__("clear")


_child_types = [DrawingElement, TimeElement, CommandElement, PositioningElement, ClearElement]
