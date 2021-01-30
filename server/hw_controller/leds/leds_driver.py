import logging
import os
from dotenv import load_dotenv
import time
import colorsys

# keep led driver and led controller separate in order to test leds without running or restarting the server everytime
# this class must not use anything server/application related
class LedsDriver:
    def __init__(self, dimensions):
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
    
    def use_dimmable(self, pin):
        try:
            if __name__ == "__main__":
                from libs.dimmable import Dimmable
            else:
                from server.hw_controller.leds.libs.dimmable import Dimmable
            self.leds = Dimmable(self.led_number, pin)
            return True
        except Exception as e:
            return self._on_import_error(e)

    def use_WS2812B(self, pin):
        # platform dependent imports
        try:
            if __name__ == "__main__":
                from libs.WS2812B import WS2812B
            else:
                from server.hw_controller.leds.libs.WS2812B import WS2812B
            self.leds = WS2812B(int(self.led_number), pin)
            return True

        except Exception as e:
            return self._on_import_error(e)

    # TODO create color with a random noise

    def rainbow(self, offset=0.0):
        if self.is_ok():
            res = []
            for i in range(0, self.led_number):
                res.append(self.hsv2rgb((offset+float(i)/self.led_number) % 1))
            self.fill(res)
    
    def hsv2rgb(self, color, saturation=1, value=1):
        return tuple(round(i*255) for i in colorsys.hsv_to_rgb(color, saturation, value)) # TODO check if darkness is in the right spot
    
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
                print("0", flush=True)
                if len(color[0]) == 1:                  # check if the list contains lists or tuples with lenght 3
                    print(1, flush=True)
                    if len(color) == 3:                 # check if the list itself must be a color tuple
                        color = tuple(color)
                        print(2, flush=True)
                    else: 
                        print(3, flush=True)
                        return False
                else: 
                    self.leds[0:len(color)] = color
                    print(4, flush=True)
                    return True
            print(5, flush=True)
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
    ld = LedsDriver((30,20))
    ld.use_WS2812B(18)
    for i in range(20):
        ld.rainbow(i/200.0)
        time.sleep(0.1)
    time.sleep(2)
    ld.white()
    time.sleep(2)
    ld.clear()