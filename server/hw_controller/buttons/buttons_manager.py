# this class gathers all the classes from the events.py file and share them with the frontend 
# (this is to avoid doubling the data on server side and frontend)
# when a button is set, the same class will listen on the GPIO for the button events

import inspect
from server.hw_controller.buttons.generic_button_event import GenericButtonEvent
import server.hw_controller.buttons.events as button_events
from server.utils.settings_utils import load_settings

BOUNCE_TIME = 300

class ButtonsManager:

    def __init__(self, app):
        self.app = app
        try:
            import RPi.GPIO as GPIO
            self._gpio_available = True
        except (RuntimeError, ModuleNotFoundError):
            self.app.logger.error("The GPIO is not accessible. If you are using a raspberry pi be sure to use superuser privileges to run this software. If the error persist open an issue on github")
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
            if not self._button is None:
                pairs = zip(settings["buttons"], self._buttons)
                # if something changed, reload all the buttons callbacks
                if not any(x != y for x, y in pairs):       # should update only if any difference has been found or if the self._button object is None
                    should_update = False
            
            if should_update:
                self._buttons = settings["buttons"]
                self._events = []
                # clear GPIO
                GPIO.cleanup()
                for b in self._buttons: 
                    bobj = self._events[self.label[b["functionality"]["value"]]](self.app)
                    GPIO.setup(b.pin.value, GPIO.IN, pull_up_down=GPIO.PUD_UP)
                    GPIO.add_event_detect(b.pin.value, GPIO.FALLING, callback = bobj.button_selected, bouncetime = BOUNCE_TIME)
                    GPIO.add_event_detect(b.pin.value, GPIO.RISING,  callback = bobj.button_released, bouncetime = BOUNCE_TIME)         # TODO check if can use two events on the same GPIO pin but with different edges

    def gpio_is_available(self):
        return self._gpio_available




