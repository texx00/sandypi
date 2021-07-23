from server.hw_controller.leds.leds_types.generic_LED_driver import GenericLedDriver
from server.hw_controller.leds.leds_types.RGBW_neopixels import RGBWNeopixels

class RGBNeopixels(GenericLedDriver):
    def __init__(self, leds_number, bcm_pin, *argvs, **kargvs):
        kargvs["colors"] = 3
        super().__init__(leds_number, bcm_pin, *argvs, **kargvs)
        try:
            import board
            import neopixel
            from adafruit_blinka.microcontroller.bcm283x.pin import Pin
            self.pixels = neopixel.NeoPixel(Pin(self.pin), self.leds_number)
            # turn off all leds
            self.clear()
        except:
            raise ModuleNotFoundError("Cannot find the libraries to control the selected hardware")          

    def fill(self, color):
        self.pixels.fill(self._normalize_color(color))
    
    def deinit(self):
        self.clear()
        self.pixels.deinit()

if __name__ == "__main__":
    from time import sleep
    leds = RGBNeopixels(5,18)
    leds.fill((100,0,0))
    leds[0] = (10,0,0)
    leds[1] = (0,10,0)
    leds[2] = (0,0,10)
    sleep(2)

    leds.deinit()
