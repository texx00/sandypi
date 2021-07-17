
import logging

class GenericLedDriver():
    def __init__(self, leds_number, bcm_pin, logger=None):
        self.leds_number = leds_number
        self.pin = bcm_pin
        self.logger = logger if not logger is None else logging.getLogger()
        self.pixels = [0] * self.leds_number
    
    def __getitem__(self, key):
        return self.pixels[key]
    
    def __setitem__(self, key, color):
        self.pixels[key] = color

    def fill(self, color):
        self.pixels[:] = color

    def clear(self):
        self.fill((0,0,0,0))
        
    # abstract methods

    def deinit(self):
        raise NotImplementedError
