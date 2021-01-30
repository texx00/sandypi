from server.utils import settings_utils
from server.hw_controller.leds.leds_driver import LedsDriver

class LedsController:
    def __init__(self, app):
        self.app = app
        settings = settings_utils.load_settings()
        dimensions = (settings["leds"]["width"], settings["leds"]["height"])
        self.dimensions = None
        self.update_settings(settings)

    # sets a fixed color for the leds
    def set_color(self, color_hsv):
        self.app.logger.warn("Color")
        self.driver.fill(self.driver.hsv2rgb(color_hsv[0], color_hsv[1], color_hsv[2]))

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
        dims = (settings["leds"]["width"], settings["leds"]["height"])
        if self.dimensions != dims:
            self.dimensions = dims
            self.driver = LedsDriver(self.dimensions)
            self.leds_type = None
            self.pin = None
        if (self.leds_type != settings["leds"]["type"]) or (self.pin != settings["leds"]["pin1"]):
            self.pin = settings["leds"]["pin1"]
            self.leds_type = settings["leds"]["type"]
            is_ok = False
            if self.leds_type == "WS2812B":
                is_ok = self.driver.use_WS2812B(self.pin)
            elif self.leds_type == "Dimmable":
                is_ok = self.driver.use_dimmable(self.pin)
            if not is_ok: 
                self.app.semits.show_toast_on_UI("Led driver type not compatible with current HW")
                self.app.logger.error("Cannot initialize leds controller")
        