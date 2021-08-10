from server.hw_controller.leds.leds_types.generic_LED_driver import GenericLedDriver

class RGBWNeopixels(GenericLedDriver):
    def __init__(self, leds_number, bcm_pin, *argvs, **kargvs):
        kargvs["colors"] = 4
        super().__init__(leds_number, bcm_pin, *argvs, **kargvs)
    
    def fill(self, color):
        self._original_colors[:] = [color]*self.leds_number
        self.pixels.fill(self._normalize_color(color))
    
    def fill_white(self):
        self.fill((0,0,0,255))
    
    # abstract methods overwrites

    def deinit(self):
        self.clear()
        self.pixels.deinit()

    def init_pixels(self):
        try:
            import board
            import neopixel
            from adafruit_blinka.microcontroller.bcm283x.pin import Pin
            self.pixels = neopixel.NeoPixel(Pin(self.pin), self.leds_number, pixel_order = neopixel.GRBW)
            # turn off all leds
            self.clear()
        except:
            raise ModuleNotFoundError("Cannot find the libraries to control the selected hardware")


if __name__ == "__main__":
    from time import sleep
    leds = RGBWNeopixels(5,18)
    leds.fill((100,0,0,0))
    leds[0] = (0,10,0,0)
    leds[1] = (0,0,10,0)
    leds[2] = (0,0,0,10)
    sleep(2)

    leds.deinit()
