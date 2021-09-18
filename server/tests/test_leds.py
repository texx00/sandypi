from server.hw_controller.leds.leds_controller import LedsController
from server import app

# cannot really test if the leds are working
# just checking that even without the correct hw the module is not breaking the sw

def test_led_driver_available():
    assert(not app.lmanager.is_available())          # the test should work on a linux server without hw leds

def test_led_driver_start():
    app.lmanager.start()

def test_led_driver_stop():
    app.lmanager.stop()

def test_led_driver_has_light_sensor():
    assert(not app.lmanager.has_light_sensor())

def test_led_reset_lights():
    app.lmanager.reset_lights()

def test_led_increase_brightness():
    app.lmanager.increase_brightness()

def test_led_decrease_brightness():
    app.lmanager.decrease_brightness()