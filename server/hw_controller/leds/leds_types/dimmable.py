from statistics import mean
from server.hw_controller.leds.leds_types.generic_LED_driver import GenericLedDriver

class Dimmable(GenericLedDriver):
    def __init__(self, leds_number, bcm_pin, *argvs, **kargvs):
        super().__init__(leds_number, bcm_pin, *argvs, **kargvs)
        try:
            import RPi.GPIO as GPIO        
            self.pwm = GPIO.PWM(self.pin, 100)
            self.pwm.start(0)
        except (RuntimeError, ModuleNotFoundError) as e:
            self.logger.error("The GPIO is not accessible. If you are using a raspberry pi be sure to use superuser privileges to run this software. \n    Be sure to check also the installation instructions dedicated to the hw options\n   If the error persist open an issue on github\n\n")
            self.logger.exception(e)
            raise ModuleNotFoundError("The GPIO module is not available")

    def fill(self, color):
        val = int(mean(color)/2.55)                 # (mean/255)*100
        self.pwm.ChangeDutyCycle(val)
        self.pixels[:] = val
    
    def __setitem__(self, key, color):
        val = int(mean(color)/2.55)                 # (mean/255)*100
        self.pwm.ChangeDutyCycle(val)
        self.pixels[key] = color
    
    def deinit(self):
        self.pwm.stop()