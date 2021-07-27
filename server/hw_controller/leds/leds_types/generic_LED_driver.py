from abc import ABC, abstractmethod
import logging

class GenericLedDriver(ABC):

    def __init__(self, leds_number, bcm_pin, logger=None, colors=3):
        self.leds_number = int(leds_number)
        self.pin = int(bcm_pin)
        self.colors = colors
        self.logger = logger if not logger is None else logging.getLogger()
        self.pixels = [0] * self.leds_number
        self._original_colors = [0] * self.leds_number
        self.brightness = 1
        self.init_pixels()
    

    def __getitem__(self, key):
        return self.pixels[key]
    

    def __setitem__(self, key, color):
        self._original_colors[key] = color
        self.pixels[key] = self._normalize_color(color)


    def fill(self, color):
        """Fill the strip with the given color"""

        self.pixels[:] = color
        self.pixels[:] = self._normalize_color(color)


    def clear(self):
        """Clears the LED strip"""

        self.fill((0,0,0,0))


    def _normalize_color(self, color):
        """Normalizes the color lenght depending on the leds type (can be 1,3 or 4 depending if is a single channel or RGB, RGBW)"""

        if len(color) < self.colors:
            tmp = [0] * self.colors
            for i, c in enumerate(color):
                tmp[i] = c
            return tuple(tmp)
        if len(color) > self.colors:
            tmp = [0] * self.colors
            for i in range(self.colors):
                tmp[i] = color[i]
            return tuple(tmp)
        return color


    def set_brightness(self, brightness):
        """Set the brightness of the LED strip
        
        The value of the brightness should be in the range 0-1"""

        self.brightness = brightness
        self.pixels[:] = self._normalize_color(list(multiply_tuple(c, brightness) for c in self._original_colors))
        

    # abstract methods
    @abstractmethod
    def deinit(self):
        """Deinitializes and free the hardware resources"""


    @abstractmethod
    def init_pixels(self):
        """Initilizes the self.pixels objects"""


def multiply_tuple(tup, fval):
    tup = tuple(i*fval for i in tup)
    return tup