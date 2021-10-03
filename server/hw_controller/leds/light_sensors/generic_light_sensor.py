from abc import abstractmethod, ABC
from threading import Thread
from time import sleep

BRIGHTNESS_MOV_AVE_SAMPLES = 20             # number of samples used in the moving average for the brightness (response time [s] ~ samples_number*sample_interval)
BRIGHTNESS_SAMPLE_INTERVAL = 0.5            # period in s for the brightness sampling with the sensor

class GenericLightSensor(ABC):

    def __init__(self, app):
        self.app = app
        self._is_running = False
        self._check_interval = BRIGHTNESS_SAMPLE_INTERVAL
        self._history = []
    
    def start(self):
        """Starts the light sensor
        
        When the light sensor is started, will control the brightness of the LEDs automatically. Will change it according to the last given color (can only dim)"""

        self._is_running = True
        self._th = Thread(target = self._thf)
        self._th.name = "light_sensor"
        self._th.start()
    
    def stop(self):
        """Stops the light sensor from controlling the LED strip"""
        self._is_running = False
        self._history = []

    def _thf(self):
        while self._is_running:
            sleep(self._check_interval)

            brightness = self.get_brightness()
            if len(self._history) == BRIGHTNESS_MOV_AVE_SAMPLES:
                self._history.pop(0)
            self._history.append(brightness)
            brightness = sum(self._history)/float(len(self._history))

            self.app.logger.info("Averaged brightness: {}".format(brightness))      # FIXME remove this
            self.app.lmanager.set_brightness(brightness)
        self.app.lmanager.set_brightness(1)
    
    def deinit(self):
        """Deinitializes the sensor hw"""

        pass

    @abstractmethod
    def get_brightness(self):
        """Returns the actual level of brightness to use"""

    @abstractmethod
    def is_connected(self):
        """Returns true if the sensor is connected correctly"""