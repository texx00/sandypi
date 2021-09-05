from server.hw_controller.leds.leds_types.generic_LED_driver import GenericLedDriver
from server.hw_controller.leds.leds_types.RGB_neopixels import RGBNeopixels

# WWA leds are RGB leds with different colors (R -> amber, G -> cold white, B -> warm white)
class WWANeopixels(RGBNeopixels):
    pass


if __name__ == "__main__":
    from time import sleep
    leds = WWANeopixels(5,18)
    leds.fill((100,0,0))
    leds[0] = (10,0,0)
    leds[1] = (0,10,0)
    leds[2] = (0,0,10)
    sleep(2)

    leds.deinit()
