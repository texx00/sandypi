from server.hw_controller.leds.leds_driver import LedsDriver

def test_led_driver_error():
    try:
        ld = LedsDriver()
    except:
        assert(True)

def test_led_driver():
    try:
        ld = LedsDriver((30,20))
        assert(True)
    except:
        assert(False)
    