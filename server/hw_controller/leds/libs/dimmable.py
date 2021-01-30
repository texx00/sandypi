import GPIO
from statistics import mean

class Dimmable():
    def __init__(self, led_number, pin_number):
        super().__init__()
        self.led_n = led_number
        self.pwm = GPIO.PWM(pin_number, 100)
        self.pwm.start(0)
        self.pixels = [0] * self.led_n
    
    def fill(self, color):
        val = int(mean(color)/2.55)                 # (mean/255)*100
        self.pwm.ChangeDutyCycle(val)
        self.pixels[:] = val


    def __getitem__(self, key):
        return self.pixels[key]
    
    def __setitem__(self, key, value):
        self.pixels[key] = value
    
    def deinit(self):
        self.pwm.stop()