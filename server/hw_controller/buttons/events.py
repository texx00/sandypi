
# in this file are defined the events that can be associated to a button

from server.hw_controller.buttons.generic_button_event import GenericButtonEvent

class StartPause(GenericButtonEvent):
    label = "Start/pause"
    description = "Resume or pause the current drawing. If nothing is in the queue starts a random drawing."

    def button_click(self):
        if self.app.qmanager.is_queue_empty():
            self.app.qmanager.start_random_drawing()
        else:
            if self.app.qmanager.is_paused():
                self.app.qmanager.resume()
            else: self.app.qmanager.pause()

    def button_long_press(self):
        pass