import json

from server.database.models import db
from server.database.playlist_elements_tables import PlaylistElements

UNKNOWN_PROGRESS = {
    "eta": -1,      # default is -1 -> ETA unknown
    "units": "s"    # ETA units
}

"""
    Base class for a playlist element
    When creating a new element type, should extend this base class
    The base class manages automatically to save the element correctly in the database if necessary

    Can override the init method but must pass **kwargs to the super().__init__ method
    execute method:
        The child element MUST implement the execute method as a generator in order to provide the commands to the feeder (can also iterate only once, but the method must be extended)
        The execute method should yield the Gcode command to execute. If None is returned instead, the feeder will skip the iteration. 
        The feeder will stop only one the StopIteration exception is raised
    before_start method:
        by default returns the same element. 
        If the element is a placeholder to calculate some other type of element can return the correct element
    get_progress method:
        Must return a dict with the following format:
            eta: float ETA value for the current element (-1 means "unknown")
            units: can be "s" or "%"
    
    See examples to understand better

    NOTE: variable starting with "_" will not be saved in the database
    NOTE: must implement the element also in the frontend (follow the instructions at the beginning of the "Elements.js" file)
"""
class GenericPlaylistElement():
    element_type = None
    
    # --- base class methods that must be implemented/overwritten in the child class ---

    def __init__(self, element_type, **kwargs):
        self.element_type = element_type
        self._pop_options = []                                                                      # list of fields that are column in the database and must be removed from the standard options (string column)
        self.add_column_field("element_type")                                                       # need to pop the element_type from the final dict because this option is a column of the table
        for v in kwargs:
            setattr(self, v, kwargs[v])
    
    # if this method return None if will not run the element in the playlist
    # can override and return another element if necessary
    def before_start(self, queue_manager):
        return self
    
    # this methods yields a gcode command line to be executed
    # the element is considered finished after the last line is yield
    # if a None value is yield, the feeder will skip to the next iteration
    def execute(self, logger):
        raise StopIteration("You must implement an iterator in every element class")

    # returns a dict with ETA
    # some type of elements may require a feedrate -> the function should always require a feedrate and should handle the case of a 0 feedrate
    # dict format:
    #  * eta: float value for the eta. Can be -1 if unknown
    #  * units: eta units ("s" or "%")
    # if an eta is not available in the child class under some conditions it is possible to use: return super().get_progress(feedrate)
    def get_progress(self, feedrate):
        return UNKNOWN_PROGRESS

    # --- base class methods - should not be necessary to overwrite these ---

    def _set_from_dict(self, values):
        for k in values:
            if hasattr("set_{}".format(k)):
                pass
            elif hasattr(k):
                setattr(self, k, values[k])
            else:
                raise ValueError
    
    def get_dict(self):
        return GenericPlaylistElement.clean_dict(self.__dict__)

    def __str__(self):
        return json.dumps(self.get_dict())

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
        
        from server.database.playlist_elements import _child_types                                  # need to import here to avoid circular import
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
