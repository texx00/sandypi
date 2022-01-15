import os
import re
import json
from pathlib import Path
from dotmap import DotMap
from time import time, sleep
from datetime import datetime, timedelta
from math import sqrt
import copy

from server.database.models import UploadedFiles
from server.database.playlist_elements_tables import get_playlist_table_class
from server.database.generic_playlist_element import GenericPlaylistElement
from server.utils.settings_utils import LINE_RECEIVED
from server.utils.gcode_converter import ImageFactory
from server.utils.settings_utils import load_settings, get_only_values

""" 
    ---------------------------------------------------------------------------

    The elements must derive from the GenericPlaylistElement class.
    Check "generic_playlist_element.py" for more detailed instructions.
    New elements must be added to the _get_elements_types list at the end of this file

    ---------------------------------------------------------------------------
""" 


"""
    Identifies a drawing element
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
        self._distance = 0
        self._total_distance = 0
        self._new_position = DotMap({"x":0, "y":0})
        self._last_position = self._new_position
        self._x_regex = re.compile("[X]([0-9.-]+)($|\s)")                                           # looks for a +/- float number after an X, until the first space or the end of the line
        self._y_regex = re.compile("[Y]([0-9.-]+)($|\s)")                                           # looks for a +/- float number after an Y, until the first space or the end of the line

        
    def execute(self, logger):
        # generate filename
        filename = os.path.join(str(Path(__file__).parent.parent.absolute()), "static/Drawings/{0}/{0}.gcode".format(self.drawing_id))
        
        # loads the total lenght of the drawing to calculate eta
        drawing_infos = UploadedFiles.get_drawing(self.drawing_id)
        self._total_distance = drawing_infos.path_length
        if (self._total_distance is None) or (self._total_distance < 0):
            self._total_distance = 0
            # if no path lenght is available try to calculate it and save it again (necessary for old versions compatibility, TODO remove this in future versions?)
            # need to open the file an extra time to analyze it completely (cannot do it while executing the element)
            try:
                with open(filename) as f:
                    settings = load_settings()
                    factory = ImageFactory(get_only_values(settings["device"]))
                    dimensions, _ = factory.gcode_to_coords(f)                                      # ignores the coordinates and use only the drawing dimensions
                    drawing_infos.path_length = dimensions["total_lenght"]                       
                    del dimensions["total_lenght"]
                    drawing_infos.dimensions_info = json.dumps(dimensions)
                    drawing_infos.save()
                    self._total_distance = drawing_infos.path_length
            except Exception as e:
                logger.exception(e)

        with open(filename) as f:
            for line in f:
                # clears the line
                if line.startswith(";"):                                                            # skips commented lines
                    continue
                if ";" in line:                                                                     # remove in line comments
                    line.split(";")
                    line = line[0]
                # calculates the distance travelled
                try:
                    if "X" in line:
                        self._new_position.x = float(self._x_regex.findall(line)[0][0])
                    if "Y" in line:
                        self._new_position.y = float(self._y_regex.findall(line)[0][0])
                    self._distance += sqrt((self._new_position.x - self._last_position.x)**2 + (self._new_position.y - self._last_position.y)**2)
                    self._last_position = copy.copy(self._new_position)
                except Exception as e:
                    logger.exception(e)
                # yields the line
                yield line

    def get_progress(self, feedrate):
        # if for some reason the total distance was not calculated the ETA is unknown
        if self._total_distance == 0:
            return super().get_progress(feedrate)

        # if a feedrate is available will use "s" otherwise will calculate the ETA as a percentage
        if feedrate <= 0:
            return {
                "eta": self._distance/self._total_distance * 100,
                "units": "%"
            }
        else:
            return {
                "eta": (self._total_distance - self._distance)/feedrate,
                "units": "s"
            }
    
    def get_path_length_total(self):
        """Returns the total lenght of the path of the drawing"""
        return self._total_distance
    
    def get_path_lenght_done(self):
        """Returns the path lenght that has been done for the current drawing"""
        return self._distance

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
        self._final_time = -1
    
    def execute(self, logger):
        self._final_time = time()
        if self.type == "alarm_type":                                                               # compare the actual hh:mm:ss to the alarm to see if it must run today or tomorrow
            now = datetime.now()
            midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)                       # get midnight and add the alarm time
            alarm_time = datetime.strptime(self.alarm_time, "%H:%M:%S")
            alarm = midnight + timedelta(hours = alarm_time.hour, minutes = alarm_time.minute, seconds = alarm_time.second)
            if alarm == now:
                return
            elif alarm < now:
                alarm += timedelta(hours=24)                                                        # if the alarm is expired for today adds 24h
            self._final_time = datetime.timestamp(alarm)
        if self.type == "expiry_date":
            self._final_time = datetime.timestamp(datetime.strptime(self.expiry_date, "%Y-%m-%d %H:%M:%S.%f"))
        elif self.type == "delay":
            self._final_time += float(self.delay)                                                   # store current time and applies the delay
        else:                                                                                       # should not be the case because the check is done already in the constructore
            return         
        
        while True:
            if time() >= self._final_time:                                                          # If the delay expires can break the while to start the next element
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

    # return a progress only if the element is running
    def get_progress(self, feedrate):
        if self._final_time != -1:
            return {
                "eta": self._final_time - time(),
                "units": "s"
            }
        else: return super().get_progress(feedrate)

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
        element = None
        if self.shuffle_type == None or self.shuffle_type == "0":
            # select random drawing
            drawing = UploadedFiles.get_random_drawing()
            if drawing is None:                                         # there is no drawing to be played
                return None
            element =  DrawingElement(drawing_id = drawing.id)
        elif self.playlist_id != 0:
            # select a random drawing from the current playlist
            res = get_playlist_table_class(self.playlist_id).get_random_drawing_element()
            # convert the db element to the drawing element format
            element = GenericPlaylistElement.create_element_from_db(res)
        element.was_random = True
        return element

"""
    Starts another playlist
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



# TODO implement also the other element types (execute method but also the frontend options)

"""
    Controls the led lights
"""
class LightsControl(GenericPlaylistElement):
    element_type = ""

    
    def __init__(self, **kwargs):
        super().__init__(element_type=LightsControl.element_type, **kwargs)


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

def _get_elements_types():
    return [DrawingElement, TimeElement, CommandElement, ShuffleElement, StartPlaylistElement, PositioningElement, ClearElement, LightsControl]
