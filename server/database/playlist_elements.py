import json
import os
from pathlib import Path

from server.database.playlist_elements_tables import PlaylistElements
from server import db

"""
    Base class for a playlist element
    When creating a new element type, should extend this base class
    The base class manages automatically to save the element correctly in the database if necessary

    Can override the init method but must pass **kwargs to the super().__init__ method
    execute method:
        The child element MUST implement the execute method as a generator in order to provide the commands to the feeder (can also iterate only once, but the method must be extended)
        The execute method should yield the Gcode command to execute. If None is returned instead, the feeder will skip the iteration. 
        The feeder will stop only one the StopIteration exception is raised
    
    See examples to understand better
"""
class GenericPlaylistElement():
    element_type = None
    
    def __init__(self, element_type, **kwargs):
        self.element_type = element_type
        self._pop_options = []                                                                      # list of fields that are column in the database and must be removed from the standard options (string column)
        self.add_column_field("element_type")                                                       # need to pop the element_type from the final dict because this option is a column of the table
        for v in kwargs:
            setattr(self, v, kwargs[v])
    
    def get_dict(self):
        return GenericPlaylistElement.clean_dict(self.__dict__)

    def __str__(self):
        return json.dumps(self.get_dict())
    
    def execute(self):
        raise StopIteration("You must implement an iterator in every element class")

    def _set_from_dict(self, values):
        for k in values:
            if hasattr("set_{}".format(k)):
                pass
            elif hasattr(k):
                setattr(self, k, values[k])
            else:
                raise ValueError
    
    # add options that must be saved in a dedicated column insted of saving them inside the generic options of the element (like the element_type)
    def add_column_field(self, option):
        self._pop_options.append(option)
    
    def save(self, element_table):
        options = self.get_dict()
        # filter other pop options
        kwargs = []
        for op in self._pop_options:
            kwargs.append(options.pop(op))
        kwargs = zip(self._pop_options, kwargs)
        kwargs = dict(kwargs)
        options = json.dumps(options)
        db.session.add(element_table(element_options = options, **kwargs))

    @classmethod
    def clean_dict(cls, val):
        return {key:value for key, value in val.items() if not key.startswith('_') and not callable(key)}

    @classmethod
    def create_element_from_dict(cls, dict_val):
        if not type(dict_val) is dict:
            raise ValueError("The argument must be a dict")
        if 'element_type' in dict_val:
            el_type = dict_val.pop("element_type")                                                  # remove element type. Should be already be choosen when using the class
        else:
            raise ValueError("the dictionary must contain an 'element_type'")
        for elementClass in _child_types:
            if elementClass.element_type == el_type:
                return elementClass(**dict_val)
        raise ValueError("'element_type' doesn't match any known element type")

    @classmethod
    def create_element_from_json(cls, json_str):
        dict_val = json.loads(json_str)
        return cls.create_element_from_dict(dict_val)

    @classmethod
    def create_element_from_db(cls, item):
        if not isinstance(item, PlaylistElements):
            raise ValueError("Need a db item from a playlist elements table")
        
        res = GenericPlaylistElement.clean_dict(item.__dict__)
        tmp = res.pop("element_options")
        res = {**res, **json.loads(tmp)}
        return cls.create_element_from_dict(res)


"""
    Identifies a drawing in the playlist
"""
class DrawingElement(GenericPlaylistElement):
    element_type = "drawing"

    def __init__(self, drawing_id=None, **kwargs):
        super(DrawingElement, self).__init__(element_type=DrawingElement.element_type, **kwargs)    # define the element type
        self.add_column_field("drawing_id")                                                         # the drawing id must be saved in a dedicated column to be able to query the database and find for example in which playlist the drawing is used
        try:
            self.drawing_id = int(drawing_id)
        except:
            raise ValueError("The drawing id must be an integer")
        
    def execute(self):
        filename = os.path.join(str(Path(__file__).parent.parent.absolute()), "static/Drawings/{0}/{0}.gcode".format(self.drawing_id))
        with open(filename) as f:
            for line in f:
                if line.startswith(";"):                                                            # skips commented lines
                    continue
                yield line


"""
    Identifies a command element (sends a specific command/list of commands to the board)
"""
class CommandElement(GenericPlaylistElement):
    element_type = "command"

    def __init__(self, command, **kwargs):
        super().__init__(element_type=CommandElement.element_type, **kwargs)
        self.command = command

    def execute(self):
        commands = self.command.replace("\r", "").split("\n")
        for c in commands:
            yield c


# TODO implement also the other element types (execute method but also the frontend options)

"""
    Identifies a timing element (delay between drawings, next drawing at specific time of the day, repetitions, etc)
"""
class TimeElement(GenericPlaylistElement):
    element_type = "timing"

    def __init__(self, delay=None, expiry_date=None, **kwargs):
        super(TimeElement, self).__init__(element_type=TimeElement.element_type, **kwargs)
        non_none = sum(i is not None for i in [delay, expiry_date])
        if non_none != 1:
            if non_none == 0:
                raise ValueError("At least one value must be specify: delay or expiry_date")
            else:
                raise ValueError("Only one of the arguments can be specified at a time")
        self.delay = delay
        self.expiry_date = expiry_date

"""
    Identifies a particular behaviour for the ball between drawings (like: move to the closest border, start from the center)
"""
class PositioningElement(GenericPlaylistElement):
    element_type = "positioning"
    def __init__(self, **kwargs):
        super().__init__(element_type=PositioningElement.element_type, **kwargs)

"""
    Identifies a "clear all" pattern
"""
class ClearElement(GenericPlaylistElement):
    element_type = "clear"

    def __init__(self, **kwargs):
        super().__init__(element_type=ClearElement.element_type, **kwargs)


_child_types = [DrawingElement, TimeElement, CommandElement, PositioningElement, ClearElement]
