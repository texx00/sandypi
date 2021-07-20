
import logging

class GenericLedDriver():
    def __init__(self, leds_number, bcm_pin, logger=None, colors=3):
        self.leds_number = leds_number
        self.pin = bcm_pin
        self.colors = colors
        self.logger = logger if not logger is None else logging.getLogger()
        self.pixels = [0] * self.leds_number
    
    def __getitem__(self, key):
        return self.pixels[key]
    
    def __setitem__(self, key, color):
        self.pixels[key] = self._normalize_color(color)

    def fill(self, color):
        self.pixels[:] = self._normalize_color(color)

    def clear(self):
        self.fill((0,0,0,0))

    def _normalize_color(self, color):
        if not len(color) == self.colors:
            tmp = [0] * self.colors
            for i, c in enumerate(color):
                tmp[i] = c
            return tuple(tmp)
        return color
        
    # abstract methods

    def deinit(self):
        raise NotImplementedError
