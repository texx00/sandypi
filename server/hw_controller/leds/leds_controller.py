from threading import Thread, Lock
from dotmap import DotMap
from time import sleep

from server.utils import settings_utils
from server.utils.custom_math import multiply_tuple

from server.hw_controller.leds.leds_types.dimmable import Dimmable
from server.hw_controller.leds.leds_types.RGB_neopixels import RGBNeopixels
from server.hw_controller.leds.leds_types.RGBW_neopixels import RGBWNeopixels
from server.hw_controller.leds.light_sensors.tsl2519 import TSL2519

class LedsController:
    def __init__(self, app):
        self.app = app
        self.dimensions = None
        self.driver = None
        self.sensor = None
        self._mutex = Lock()
        self._should_update = False
        self._running = False
        self._color = (0,0,0,0)
        self.update_settings(settings_utils.load_settings())

    def is_available(self):
        return not self.driver is None

    def has_light_sensor(self):
        if not self.sensor is None:
            return self.sensor.is_connected()
        return False

    def start(self):
        if not self.driver is None:
            self._running = True
            self._th = Thread(target = self._thf, daemon=True)
            self._th.name = "leds_controller"
            self._th.start()
    
    def stop(self):
        with self._mutex:
            self.driver.clear()
            self._running = False
    
    def _thf(self):
        self.app.logger.info("Leds controller started")
        try:
            while(True):
                with self._mutex:
                    if self._should_update:
                        self.driver.fill(self._color)
                        self._should_update = False
                    if not self._running:
                        break
                sleep(0.01)
        except Exception as e:
            self.app.logger.exception(e)

        if not self.driver is None:
            self.driver.deinit()
        self.app.logger.info("Leds controller stopped")

    # sets a fixed color for the leds
    def set_color(self, color):
        r = int(color[1:3], 16)
        g = int(color[3:5], 16)
        b = int(color[5:7], 16)
        w = 0
        if len(color)>7:
            w = int(color[7:9], 16)
        with self._mutex:
            self._color = (r, g, b, w)
            self._should_update = True

    def set_brightness(self, brightness):
        color = multiply_tuple(self._color, brightness)
        if not self.driver is None:
            self.driver.fill(color)

    def start_animation(self, animation):
        # TODO add animations picker:
        # may add animations like:
        #  * a rainbow color moving around (may choose speed, saturation, direction, multiple rainbows etc)
        #  * random colors (maybe based on normalized 3d perlin noise and selection the nodes coordinates?)
        #  * custom gradients animations
        #  * custom colors sequences animations
        #  * "follow the ball" animation (may be quite difficult due to the delay between commands sent to the board and actual ball movement)
        pass

    # Updates dimensions of the led matrix
    # Updates the led driver object only if the dimensions are changed
    def update_settings(self, settings):
        restart = False
        if self._running:
            self.stop()
            restart = True
        settings = DotMap(settings_utils.get_only_values(settings))
        dims = (int(settings.leds.width), int(settings.leds.height), int(settings.leds.circumference))
        if self.dimensions != dims:
            self.dimensions = dims
            self.leds_type = None
            self.pin = None
        if (self.leds_type != settings.leds.type) or (self.pin != settings.leds.pin1):
            self.pin = settings.leds.pin1
            self.leds_type = settings.leds.type
            try:
                # the leds number calculation depends on the type of table. 
                # If is square or rectangular should use a base and height, for round tables will use the total number of leds directly
                leds_number = (int(self.dimensions[0]) + int(self.dimensions[1]))*2 if settings.device.type == "Cartesian" else int(self.dimensions[2])
                if self.leds_type == "RGB":
                    self.driver = RGBNeopixels(leds_number, settings.leds.pin1, logger=self.app.logger)
                elif self.leds_type == "RGBW":
                    self.driver = RGBWNeopixels(leds_number, settings.leds.pin1, logger=self.app.logger)
                elif self.leds_type == "Dimmable":
                    self.driver = Dimmable(leds_number, settings.leds.pin1, logger=self.app.logger)
            except Exception as e: 
                self.driver = None
                self.app.semits.show_toast_on_UI("Led driver type not compatible with current HW")
                self.app.logger.exception(e)
                self.app.logger.error("Cannot initialize leds controller")
            try: 
                if settings.leds.light_sensor == "TSL2519":
                    self.sensor = TSL2519(self.app)
                else:
                    if not self.sensor is None:
                        self.sensor.deinit()
            except Exception as e:
                if self.is_available():
                    self.app.semits.show_toast_on_UI("The select sensor is not compatible with the current setup")
                self.app.logger.error("Cannot initialize leds light sensor")
                self.app.logger.exception(e)

        if restart:
            self.start()
        