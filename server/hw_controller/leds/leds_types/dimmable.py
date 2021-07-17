import GPIO
from statistics import mean
from GenericLedDriver import GenericLedDriver

class Dimmable(GenericLedDriver):
    def __init__(self, leds_number, bcm_pin, *argvs, **kargvs):
        super().__init__(leds_number, bcm_pin, argvs, kargvs)
        self.pwm = GPIO.PWM(pin_number, 100)
        self.pwm.start(0)
    
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