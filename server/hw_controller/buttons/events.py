
# in this file are defined the events that can be associated to a button

from server.hw_controller.buttons.generic_button_event import GenericButtonEvent

# TODO may be interesting to separate the click function from the long press function to combine and customize the functionalities with just a few buttons

class StartPause(GenericButtonEvent):
    label = "Start/pause drawing"
    description = "Resumes or pauses the current drawing. If nothing is in the queue starts a random drawing."

    def button_click(self):
        if self.app.qmanager.is_queue_empty():
            self.app.qmanager.start_random_drawing(repeat=True)
        else:
            if self.app.qmanager.is_paused():
                self.app.qmanager.resume()
            else: self.app.qmanager.pause()

    def button_long_press(self):
        pass

class StartNext(GenericButtonEvent):
    label = "Start next drawing"
    description = "Starts the next drawing. With a long press stops the current drawing and clears the queue"

    def __init__(self, *argv, **kargv):
        super().__init__(*argv, **kargv)

    def button_click(self):
        from server.sockets_interface.socketio_callbacks import queue_next_drawing
        queue_next_drawing()

    def button_long_press(self):
        from server.sockets_interface.socketio_callbacks import queue_stop_all
        queue_stop_all()
