from server.hw_controller.leds.light_sensors.generic_light_sensor import GenericLightSensor
from math import sqrt

LUX_MAX = 30
BRIGHTNESS_MIN = 0.05

class TSL2591(GenericLightSensor):
    """Light sensor based on TSL2519 (I2C) sensor"""

    def __init__(self, app):
        super().__init__(app)
        try: 
            import board
            import adafruit_tsl2591
            i2c = board.I2C()
            self._sensor = adafruit_tsl2591.TSL2591(i2c)
        except:
            raise ModuleNotFoundError("Cannot find the libraries to control the selected hardware")

    def get_brightness(self):
        lux = self._sensor.lux
        tmp = max(sqrt(min(lux, LUX_MAX)/LUX_MAX), BRIGHTNESS_MIN)              # calculating the brightness to use
        self.app.logger.info("Sensor light intensity: {} lux".format(lux))      # FIXME remove this
        self.app.logger.info("Sensor current brightness: {}".format(tmp))       # FIXME remove this
        return tmp          

    def is_connected(self):
        return not self._sensor is None
