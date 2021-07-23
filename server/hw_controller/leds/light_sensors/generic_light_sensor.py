from abc import abstractmethod, ABC

class GenericLightSensor(ABC):

    @abstractmethod
    def get_light(self):
        """Returns the actual level of light in [lux]"""
        pass