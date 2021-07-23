from abc import ABC, abstractmethod
import logging

class GenericLedDriver(ABC):
    def __init__(self, leds_number, bcm_pin, logger=None, colors=3):
        self.leds_number = int(leds_number)
        self.pin = int(bcm_pin)
        self.colors = colors
        self.logger = logger if not logger is None else logging.getLogger()
        self.pixels = [0] * self.leds_number
        self.init_pixels()
    
    def __getitem__(self, key):
        return self.pixels[key]
    
    def __setitem__(self, key, color):
        self.pixels[key] = self._normalize_color(color)

    def fill(self, color):
        self.pixels[:] = self._normalize_color(color)

    def clear(self):
        self.fill((0,0,0,0))

    def _normalize_color(self, color):
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
        # TODO create this
        pass
        
    # abstract methods
    @abstractmethod
    def deinit(self):
        """Deinitializes and free the hardware resources"""

    @abstractmethod
    def init_pixels(self):
        """Initilizes the self.pixels objects"""
