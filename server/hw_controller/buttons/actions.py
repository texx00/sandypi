from colorsys import hsv_to_rgb
from random import random
# in this file are defined the events that can be associated to a button

from server.hw_controller.buttons.generic_button_event import GenericButtonAction

class StartPause(GenericButtonAction):
    label = "Start/pause drawing"
    description = "Resumes or pauses the current drawing. If nothing is in the queue starts a random drawing."

    def execute(self):
        if self.app.qmanager.is_queue_empty():
            self.app.qmanager.start_random_drawing(repeat=True)
        else:
            if self.app.qmanager.is_paused():
                self.app.qmanager.resume()
            else: self.app.qmanager.pause()


class StopAll(GenericButtonAction):
    label = "Stop drawing and queue"
    description = "Stops the current drawing and the queue"

    def execute(self):
        from server.sockets_interface.socketio_callbacks import queue_stop_all
        queue_stop_all()


class StartNext(GenericButtonAction):
    label = "Start next drawing"
    description = "Starts the next drawing in the queue"

    def execute(self):
        from server.sockets_interface.socketio_callbacks import queue_next_drawing
        queue_next_drawing()


class BrightnessUp(GenericButtonAction):
    label = "Brightness up"
    description = "Increases the LEDs brightness"

    def execute(self):
        self.app.lmanager.increase_brightness()

    def tic(self, tic):
        self.execute()


class BrightnessDown(GenericButtonAction):
    label = "Brightness down"
    description = "Decreases the LEDs brightness"

    def execute(self):
        self.app.lmanager.decrease_brightness()
    
    def tic(self, tic):
        self.execute()


class BrightnessUpDown(GenericButtonAction):
    label = "Change LEDs brightness"
    description = "Changes LEDs brightness with a long press. After releasing the button the mode is toggled between ramp up and ramp down"
    usage = "long"
    
    def __init__(self, *args, **kargv):
        super().__init__(*args, **kargv)
        self.increasing = True

    def execute(self):
        self.increasing = not self.increasing
        # if lights are completely up should decrease
        if not self.app.lmanager.driver is None:
            if self.app.lmanager.driver.brightness == 1:
                self.increasing = False
            # if lights are completely down should increase
            if self.app.lmanager.driver.brightness == 0:
                self.increasing = True

    def tic(self, tic):
        if self.increasing:
            self.app.lmanager.increase_brightness()
        else:
            self.app.lmanager.decrease_brightness()


class LEDsChangeColor(GenericButtonAction):
    label = "Choose random color"
    description = "Chooses a random color for the LEDs"

    def execute(self):
        rgb = hsv_to_rgb(random(),1,1)
        c = [i*255 for i in rgb]
        self.app.lmanager.fill(c)

