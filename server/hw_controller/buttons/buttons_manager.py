# this class gathers all the classes from the events.py file and share them with the frontend 
# (this is to avoid doubling the data on server side and frontend)
# when a button is set, the same class will listen on the GPIO for the button events

import inspect
from server.hw_controller.buttons.generic_button_event import GenericButtonEvent
import server.hw_controller.buttons.events as button_events
from server.utils.settings_utils import load_settings

BOUNCE_TIME = 100

class ButtonsManager:

    def __init__(self, app):
        self.app = app
        try:
            import RPi.GPIO as GPIO
            self._gpio_available = True
        except (RuntimeError, ModuleNotFoundError):
            self.app.logger.error("The GPIO is not accessible. If you are using a raspberry pi be sure to use superuser privileges to run this software. \n    Be sure to check also the installation instructions dedicated to the hw options\n   If the error persist open an issue on github\n\n")
            self._gpio_available = False

        # loading events
        self._events = {}
        self._buttons = None
        self._labels = {}
        self.available_buttons_events = []
        for cl in inspect.getmembers(button_events, inspect.isclass):
            if not cl[1] == GenericButtonEvent:
                # preparing array for the frontend (will be jsonized)
                self.available_buttons_events.append({"description": cl[1].description, "label": cl[1].label, "name": cl[0]})
                self._events[cl[0]] = cl[1]
                self._labels[cl[1].label] = cl[0]
        
        self.update(load_settings())
    
    def get_buttons_options(self):
        return self.available_buttons_events
    
    def update(self, settings):
        if self.gpio_is_available():
            settings = settings["buttons"]
            should_update = True
            if not self._buttons is None:
                pairs = zip(settings["buttons"], self._buttons)
                # if something changed, reload all the buttons callbacks
                if not any(x != y for x, y in pairs):       # should update only if any difference has been found or if the self._button object is None
                    should_update = False
            
            if should_update:
                import RPi.GPIO as GPIO 
                if not self._buttons is None:
                    # clear GPIO
                    for b in self._buttons:
                        try:
                            GPIO.remove_event_detect(int(b["pin"]["value"]))
                        except:
                            pass
                    GPIO.cleanup()
                GPIO.setmode(GPIO.BCM)
                self._buttons = settings["buttons"]
                # set new callbacks 
                for b in self._buttons:
                    try:
                        pin = int(b["pin"]["value"])
                    except:
                        self.app.logger.error("Check the button pin number. Looks like is not a number")
                    bobj = self._events[self._labels[b["functionality"]["value"]]](self.app, pin)
                    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)              # TODO add options for pullup/pulldown resistors and button state inversion
                    GPIO.add_event_detect(pin, GPIO.BOTH, callback = bobj.button_change, bouncetime = BOUNCE_TIME)          # the rising or falling edge is detected in the button event class
                    
    def gpio_is_available(self):
        return self._gpio_available




