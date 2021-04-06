import json
import os
from pathlib import Path

from sqlalchemy.orm import load_only
from server.database.models import UploadedFiles
from time import time, sleep
from datetime import datetime, timedelta

from server.database.playlist_elements_tables import PlaylistElements, get_playlist_table_class
from server import db
from server.utils.settings_utils import LINE_RECEIVED

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

    NOTE: must implement the element also in the frontend (follow the instructions at the beginning of the "Elements.js" file)
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
    
    def execute(self, logger):
        raise StopIteration("You must implement an iterator in every element class")

    def _set_from_dict(self, values):
        for k in values:
            if hasattr("set_{}".format(k)):
                pass
            elif hasattr(k):
                setattr(self, k, values[k])
            else:
                raise ValueError

    # if this method return None if will not run the element in the playlist
    # can override if should not run the current element but something else
    def before_start(self, queue_manager):
        return self

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
        
    def execute(self, logger):
        filename = os.path.join(str(Path(__file__).parent.parent.absolute()), "static/Drawings/{0}/{0}.gcode".format(self.drawing_id))
        with open(filename) as f:
            for line in f:
                if line.startswith(";"):                                                            # skips commented lines
                    continue
                if ";" in line:                                                                     # remove in line comments
                    line.split(";")
                    line = line[0]
                yield line


"""
    Identifies a command element (sends a specific command/list of commands to the board)
"""
class CommandElement(GenericPlaylistElement):
    element_type = "command"

    def __init__(self, command, **kwargs):
        super().__init__(element_type=CommandElement.element_type, **kwargs)
        self.command = command

    def execute(self, logger):
        commands = self.command.replace("\r", "").split("\n")
        for c in commands:
            yield c


"""
    Identifies a timing element (delay between drawings, next drawing at specific time of the day, repetitions, etc)
"""
class TimeElement(GenericPlaylistElement):
    element_type = "timing"

    # delay: wait the specified amount of seconds
    # expiry_date: allows to specify a date and an hour after which the drawing will continue
    # alarm_time: can specify a time in the day at which can go on with the playlist (like 5 a.m. to get a new drawing in the morning without having it drawing the entire night)
    def __init__(self, delay=None, expiry_date=None, alarm_time=None, type="", **kwargs):
        super(TimeElement, self).__init__(element_type=TimeElement.element_type, **kwargs)
        self.delay = delay if delay != "" else None
        self.expiry_date = expiry_date if expiry_date != "" else None
        self.alarm_time = alarm_time if alarm_time != "" else None
        self.type = type
        self._final_time = 0
    
    def execute(self, logger):
        self._final_time = time()
        if self.type == "alarm_type":                                                                 # compare the actual hh:mm:ss to the alarm to see if it must run today or tomorrow
            now = datetime.now()
            midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)                           # get midnight and add the alarm time
            alarm_time = datetime.strptime(self.alarm_time, "%H:%M:%S")
            alarm = midnight + timedelta(hours = alarm_time.hour, minutes = alarm_time.minute, seconds = alarm_time.second)
            if alarm == now:
                return
            elif alarm < now:
                alarm += timedelta(hours=24)                                                            # if the alarm is expired for today adds 24h
            self._final_time = datetime.timestamp(alarm)
        if self.type == "expiry_date":
            self._final_time = datetime.timestamp(datetime.strptime(self.expiry_date, "%Y-%m-%d %H:%M:%S.%f"))
        elif self.type == "delay":
            self._final_time += float(self.delay)                                                             # store current time and applies the delay
        else:                                                                                           # should not be the case because the check is done already in the constructore
            return         
        

        while True:
            if time() >= self._final_time:                                                                    # If the delay expires can break the while to start the next element
                break
            elif time() < self._final_time-1:
                logger.log(LINE_RECEIVED, "Waiting {:.1f} more seconds".format(self._final_time-time()))
                sleep(1)
                yield None
            else: 
                sleep(self._final_time-time())
                yield None
    
    # updates the delay value
    # used when in continuous mode
    def update_delay(self, interval):
        self._final_time += (float(interval - self.delay))
        self.delay = interval

"""
    Plays an element in the playlist with a random order
"""
class ShuffleElement(GenericPlaylistElement):
    element_type = "shuffle"

    def __init__(self, shuffle_type=None, playlist_id=None, **kwargs):
        super(ShuffleElement, self).__init__(element_type=ShuffleElement.element_type, **kwargs)
        self.playlist_id = int(playlist_id) if playlist_id is not None else 0
        self.shuffle_type = shuffle_type

    def before_start(self, app):
        if self.shuffle_type == None or self.shuffle_type == "0":
            # select random drawing
            return DrawingElement(drawing_id = UploadedFiles.get_random_drawing().id)
        elif self.playlist_id != 0:
            # select a random drawing from the current playlist
            res = get_playlist_table_class(self.playlist_id).get_random_drawing_element()
            # convert the db element to the drawing element format
            return GenericPlaylistElement.create_element_from_db(res)
        return None

"""
    Start another playlist
"""
class StartPlaylistElement(GenericPlaylistElement):
    element_type = "start_playlist"

    def __init__(self, playlist_id=None, **kwargs):
        super(StartPlaylistElement, self).__init__(element_type=StartPlaylistElement.element_type, **kwargs)
        self.playlist_id = int(playlist_id) if playlist_id is not None else 0
    
    def before_start(self, app):
        # needs to import here to avoid circular import issue
        from server.sockets_interface.socketio_callbacks import playlist_queue
        playlist_queue(self.playlist_id)
        return None

"""
    Controls the led lights
"""
class LightsControl(GenericPlaylistElement):
    element_type = ""

    
    def __init__(self, **kwargs):
        super().__init__(element_type=LightsControl.element_type, **kwargs)


# TODO implement also the other element types (execute method but also the frontend options)

"""
    Identifies a particular behaviour for the ball between drawings (like: move to the closest border, start from the center) (should put this as a drawing option?)
"""
class PositioningElement(GenericPlaylistElement):
    element_type = "positioning"
    def __init__(self, **kwargs):
        super().__init__(element_type=PositioningElement.element_type, **kwargs)

"""
    Identifies a "clear all" pattern (really necessary?)
"""
class ClearElement(GenericPlaylistElement):
    element_type = "clear"

    def __init__(self, **kwargs):
        super().__init__(element_type=ClearElement.element_type, **kwargs)


_child_types = [DrawingElement, TimeElement, CommandElement, ShuffleElement, StartPlaylistElement, PositioningElement, ClearElement, LightsControl]
