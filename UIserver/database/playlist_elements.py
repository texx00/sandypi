import json

"""
    Base class for a playlist element
"""
class BasicPlaylistElement():
    def __init__(self, element_type):
        self.element_type = element_type
    
    def get_dict(self):
        return {key:value for key, value in self.__dict__.items() if not key.startswith('_') and not callable(key)}

    def __str__(self):
        return json.dumps(self.get_dict())

    @classmethod
    def create_from_json(cls, json_str):
        if cls is BasicPlaylistElement:
            raise NameError("Must use a child class")
        dict_val = json.loads(json_str)
        dict_val.pop("element_type")        # remove element type. Should be already be choosen when using the class
        return cls(**dict_val)


"""
    Identifies a drawing in the playlist
"""
class DrawingElement(BasicPlaylistElement):
    def __init__(self, drawing_code=None):
        super().__init__("drawing")         # define the element type
        try:
            drawing_code = int(drawing_code)
            self.drawing_code = drawing_code
        except:
            raise ValueError("The drawing code must be an integer")
            self.drawing_code = None

"""
    Identifies a timing element (delay between drawings, next drawing at specific time of the day, repetitions, etc)
"""
class TimeElement(BasicPlaylistElement):
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
class CommandElement(BasicPlaylistElement):
    def __init__(self, command):
        super().__init__("command")

"""
    Identifies a particular behaviour for the ball between drawings (like: move to the closest border, start from the center)
"""
class PositioningElement(BasicPlaylistElement):
    def __init__(self):
        super().__init__("positioning")

"""
    Identifies a "clear all" pattern
"""
class ClearElement(BasicPlaylistElement):
    def __init__(self):
        super().__init__("clear")



if __name__ == "__main__":
    de = DrawingElement(5)
    ex = '{"element_type": "drawing", "drawing_code": 8}'
    p = DrawingElement.create_from_json(ex)
    print(p)
    print(de)

    e = BasicPlaylistElement.create_from_json(ex)