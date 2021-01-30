from server.utils import settings_utils
from server.hw_controller.leds.leds_driver import LedsDriver
from threading import Thread, Lock

class LedsController:
    def __init__(self, app):
        self.app = app
        settings = settings_utils.load_settings()
        self.dimensions = None
        self.update_settings(settings)
        self._should_update = False
        self.mutex = Lock()
        # may have problems with the leds controller if self.driver.deinit or self.stop is not called on app shutdown

    def start(self):
        self._running = True
        self._th = Thread(target = self._thf, daemon=True)
        self._th.name = "leds_controller"
        self._th.start()
    
    def stop(self):
        self._running = False
    
    def _thf(self):
        self.app.logger.error("Leds controller started")
        while(self._running):
            with self.mutex:
                if (self._should_update):
                    self.driver.fill(self._color)
                    self._should_update = False
        self.app.logger.error("test")
        self.driver.deinit()

    # sets a fixed color for the leds
    def set_color(self, color):
        with self.mutex:
            self._color = color
            self._should_update = True

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
        