import board
import neopixel

LED_FREQ = 800000

class WS2812B():
    def __init__(self, led_number, pin_number):
        super().__init__()
        self.led_n = led_number
        # TODO use the selected pin number
        self.pixels = neopixel.NeoPixel(board.D18, self.led_n)
        # turn off all leds
        #self.fill((0,0,0))
    
    def fill(self, color):
        self.pixels.fill(color)

    def __getitem__(self, key):
        return self.pixels[key]
    
    def __setitem__(self, key, value):
        self.pixels[key] = value
    
    def deinit(self):
        self.pixels.deinit()
