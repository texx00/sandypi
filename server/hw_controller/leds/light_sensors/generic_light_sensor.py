from abc import abstractmethod, ABC
from threading import Thread
from time import sleep

class GenericLightSensor(ABC):

    def __init__(self, app):
        self.app = app
        self._is_running = False
        self._check_interval = 0.5          # period over which should check the light value
    
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
        self.app.lmanager.set_brightness(1)

    def _thf(self):
        while self._is_running:
            sleep(self._check_interval)
            self.app.lmanager.set_brightness(self.get_brightness())
    
    def deinit(self):
        """Deinitializes the sensor hw"""

        pass

    @abstractmethod
    def get_brightness(self):
        """Returns the actual level of brightness to use"""

    @abstractmethod
    def is_connected(self):
        """Returns true if the sensor is connected correctly"""