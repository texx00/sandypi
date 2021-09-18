# TODO remove this file before merging to beta/master

import board
import adafruit_tsl2591
import time

i2c = board.I2C()
sensor = adafruit_tsl2591.TSL2591(i2c)

while(True):
    print(sensor.lux)
    time.sleep(1)