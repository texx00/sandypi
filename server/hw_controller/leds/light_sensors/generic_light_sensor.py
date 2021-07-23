from abc import abstractmethod, ABC
from threading import Thread
from time import sleep

class GenericLightSensor(ABC):

    def __init__(self, app):
        self.app = app
        self._is_running = False
        self._check_interval = 0.5          # period over which should check the light value
    
    def start(self):
        self._is_running = True
        self._th = Thread(target = self._thf)
        self._th.name = "light_sensor"
        self._th.start()
    
    def stop(self):
        self._is_running = False

    def _thf(self):
        while self._is_running:
            sleep(self._check_interval)
            self.app.lmanager.set_brightness(self.get_brightness())

    @abstractmethod
    def get_brightness(self):
        """Returns the actual level of light in [lux]"""