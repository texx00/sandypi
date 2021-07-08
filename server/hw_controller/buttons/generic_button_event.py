from time import time
from threading import Thread, Lock

class GenericButtonEvent:
    # these two fields will be used in the frontend as fields in a dropdown to select the button functionality
    label = "---"
    description = "Generic description"
    
    # mandatory method
    def button_click(self):
        raise NotImplementedError("This method must be overwritten in the child class")

    # optional method
    def button_long_press(self):
        pass

    # optional method
    # iteration: number of the tic
    def button_long_press_tic(self, tic):
        pass

    # should not be necessary to overwrite the following methods

    def __init__(self, app):
        self.app = app
        self._selected_time = 0             # time at which the button was pressed
        self._long_time = 2                 # s after which the button is considered "long pressed"
        self._tic_time = 1                  # s after which the "long pressed" button starts ticking
        self._mutex = Lock()
        self._stop = True
    
    def get_description(self):
        return self.description

    # event called by the hw manager when the button is pressed down
    def button_selected(self):
        self._selected_time = time()
        self._stop = False
        self._th = Thread(target = self._thf, daemon=True)
        self._th.name = "button_events"
        self._th.start()

    # event called by the hw manager when the button is released
    # will automatically use one between button_click or button_long_press according to the time delay set
    def button_released(self):
        with self._mutex:
            self._stop = True
        self._th.join()

        if time() > self._selected_time + self._long_time:
            self.button_long_press()
        else:
            self.button_click()

    # thread funtion that manage the tics
    def _thf(self):
        current_time = 0
        tics = 0
        while(True):
            current_time = time()
            if self._selected_time + self._long_time > current_time:
                if self._selected_time - current_time - self._long_time > tics * self._tic_time:
                    tics += 1
                    self.button_long_press_tic(tics)
            
            with self._mutex:
                if self._stop:
                    break