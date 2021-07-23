from server.hw_controller.leds.light_sensors.generic_light_sensor import GenericLightSensor

class TSL2519(GenericLightSensor):
    def __init__(self, app):
        super().__init__(app)
        #TODO implement sensor creation

    def get_brightness(self):
        return 0
        # TODO implement sensor reading
    
