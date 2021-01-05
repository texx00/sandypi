import logging
import os
from dotenv import load_dotenv
import time
import colorsys


class LedDriver:
    def __init__(self, dimensions):
        super().__init__()
        # logger setup
        self.logger = logging.getLogger(__name__)
        load_dotenv()
        level = os.getenv("LEDS_LEVEL")
        if not level is None:
            level = int(level)
        else:
            level = 0
        self.logger.setLevel(level)

        if not dimensions:
            raise ValueError("It is necessary to set a width and height for the leds frame")

        # setting up leds
        self.dimensions = dimensions
        self.led_number = 2*(dimensions[0] + dimensions[1])
        self.leds = None
    
    def use_WS2812B(self):
        # platform dependent imports
        try:
            from WS2812B import WS2812B
            self.leds = WS2812B(self.led_number)
            return True

        except Exception as e:
            return self._on_import_error(e)

    def rainbow(self, offset=0.0):
        if self.is_ok():
            res = []
            for i in range(0, self.led_number):
                res.append(self.h2rgb((offset+float(i)/self.led_number) % 1))
            self.fill(res)
    
    def h2rgb(self, col):
        return tuple(round(i*255) for i in colorsys.hsv_to_rgb(col,1,1))
    
    def _on_import_error(self, e):
        self.logger.error("There was an error during the preparation of the led controller. Check that you installed the correct libraries to run the led of the choosen type")
        self.logger.exception(e)
        return False

    # check if the leds are initialized
    def is_ok(self):
        return not self.leds is None

    def set_pixel(self, val, col):
        if self.is_ok():
            self.leds[val] = col

    # can accept tuple(r,g,b) to fill the strip or can use directly a list of colors to use for each pixel(faster than filling one pixel at a time, because after setting the elements the strip is refreshed)
    def fill(self, color):
        if self.is_ok():
            if type(color) is list:
                if len(color[0]) == 1:                  # check if the list contains lists or tuples with lenght 3
                    print(1)
                    if len(color) == 3:                 # check if the list itself must be a color tuple
                        color = tuple(color)
                        print(2)
                    else: 
                        print(3)
                        return False
                else: 
                    self.leds[0:len(color)] = color
                    return True
            self.leds.fill(color)
            return True
        return False
    
    def clear(self):
        self.fill((0,0,0))

    def white(self):
        self.fill((255,255,255))

    def deinit(self):
        self.leds.deinit()
        self.leds = None



if __name__=="__main__":
    ld = LedDriver((30,20))
    ld.use_WS2812B()
    for i in range(200):
        ld.rainbow(i/200.0)
        time.sleep(0.1)
    time.sleep(2)
    ld.white()
    time.sleep(2)
    ld.clear()