from abc import ABC, abstractmethod
import logging
from math import floor

BRIGHTNESS_CHANGE_VALUE = 0.1

class GenericLedDriver(ABC):

    def __init__(self, leds_number, bcm_pin, logger=None, colors=3):
        self.leds_number = int(leds_number)
        self.pin = int(bcm_pin)
        self.colors = colors
        self.logger = logger if not logger is None else logging.getLogger()
        self.pixels = [0] * self.leds_number
        self._original_colors = [[0]*self.colors for i in range(self.leds_number)]
        self.brightness = 1
        self.init_pixels()


    def __getitem__(self, key):
        return self.pixels[key]


    def __setitem__(self, key, color):
        self._original_colors[key] = color
        self.pixels[key] = self._normalize_color(color)


    def fill(self, color):
        """Fill the strip with the given color"""

        self._original_colors[:] = [color]*self.leds_number
        self.pixels[:] = self._normalize_color(color)

    def fill_white(self):
        self.fill((255,255,255))

    def clear(self):
        """Clears the LED strip"""

        self.fill((0,0,0,0))


    def _normalize_color(self, color):
        """Normalizes the color lenght depending on the leds type (can be 1,3 or 4 depending if is a single channel or RGB, RGBW)

        Fixes also the color brightness"""

        # If a list of colors is give iterates over all the elements
        if type(color[0]) in (list, tuple) :
            return [self._normalize_color(c) for c in color]

        tmp = [0] * self.colors
        if len(color) < self.colors:
            for i, c in enumerate(color):
                tmp[i] = floor(c * self.brightness)
        else:
            for i in range(self.colors):
                tmp[i] = floor(color[i] * self.brightness)
        return tuple(tmp)


    def set_brightness(self, brightness):
        """Set the brightness of the LED strip
        
        The value of the brightness should be in the range 0-1"""

        brightness = min(1, max(0, brightness))     # restrict the brightness to be inside the range

        if brightness != self.brightness:
            self.brightness = brightness
            self.pixels[:] = self._normalize_color(self._original_colors)
        
    def increase_brightness(self):
        self.set_brightness(self.brightness + BRIGHTNESS_CHANGE_VALUE)
    
    def decrease_brightness(self):
        self.set_brightness(self.brightness - BRIGHTNESS_CHANGE_VALUE)

    # abstract methods
    @abstractmethod
    def deinit(self):
        """Deinitializes and free the hardware resources"""


    @abstractmethod
    def init_pixels(self):
        """Initilizes the self.pixels objects"""
