import board
import neopixel
from adafruit_blinka.microcontroller.bcm283x.pin import Pin
from server.hw_controller.leds.leds_types.generic_LED_driver import GenericLedDriver

class RGBWNeopixels(GenericLedDriver):
    def __init__(self, leds_number, bcm_pin, *argvs, **kargvs):
        super().__init__(leds_number, bcm_pin, *argvs, **kargvs)
        self.pixels = neopixel.NeoPixel(Pin(self.pin), self.leds_number, pixel_order = neopixel.GRBW)
        # turn off all leds
        self.fill((0,0,0,0))
    
    def fill(self, color):
        self.pixels.fill(color)
    
    def deinit(self):
        self.clear()
        self.pixels.deinit()


if __name__ == "__main__":
    from time import sleep
    leds = RGBWNeopixels(5,18)
    leds.fill((100,0,0,0))
    leds[0] = (0,10,0,0)
    leds[1] = (0,0,10,0)
    leds[2] = (0,0,0,10)
    sleep(2)

    leds.deinit()
