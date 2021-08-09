from statistics import mean
from server.hw_controller.leds.leds_types.generic_LED_driver import GenericLedDriver

class Dimmable(GenericLedDriver):
    def __init__(self, leds_number, bcm_pin, *argvs, **kargvs):
        super().__init__(leds_number, bcm_pin, colors=1, *argvs, **kargvs)
        
    def fill(self, color):
        self._original_colors[:] = [color]*self.leds_number
        val = int(mean(color)/2.55)                 # (mean/255)*100
        self.pwm.ChangeDutyCycle(val)
        self.pixels[:] = color
    
    def __setitem__(self, key, color):
        val = int(mean(color)/2.55)                 # (mean/255)*100
        self.pwm.ChangeDutyCycle(val)
        self.pixels[key] = color
        self._original_colors[:] = [color]*self.leds_number
    
    # abstract methods overrides

    def deinit(self):
        self.pwm.stop()

    def init_pixels(self):
        try:
            import RPi.GPIO as GPIO
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.pin, GPIO.OUT)     
            self.pwm = GPIO.PWM(self.pin, 100)
            self.pwm.start(0)
        except (RuntimeError, ModuleNotFoundError) as e:
            raise