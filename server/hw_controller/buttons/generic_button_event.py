from time import time
from threading import Thread, Lock

class GenericButtonAction:
    # these two fields will be used in the frontend as fields in a dropdown to select the button functionality
    label = "---"
    description = "Generic description"
    usage = "all"           # used to filter actions that could be done with long press or short press only. Possible values: "all", "short", "long"

    def __init__(self, app):
        self.app = app

    # this method is called when the action is used
    def execute(self):
        raise NotImplementedError("This method must be overwritten in the child class")
    
    # (optional) this method is used only for long press actions and every tic 
    # has the tic number as an argument
    def tic(self, tic):
        pass


class DummyAction(GenericButtonAction):
    """Dummy action created to be used in place of 'no action'"""

    def __init__(self):
        super().__init__(None)

    def execute(self):
        pass


class GenericButtonEventManager:
    
    def __init__(self, app, pin):
        self.pin = pin
        self.app = app
        self._selected_time = 0             # time at which the button was pressed
        self._long_time = 1                 # s after which the button is considered "long pressed"
        self._tic_delay = 1                 # s after the long press at which should start ticking
        self._tic_time = 0.5                # s after which the "long pressed" button starts ticking
        self._mutex = Lock()
        self._stop = True
        self._click_action = DummyAction()
        self._long_press_action = DummyAction()
        self._invert_logic = False
        self._th = None

    def set_click_action(self, action):
        if issubclass(type(action), GenericButtonAction):
            self._click_action = action
        else: self._click_action = DummyAction()

    def set_long_press_action(self, action):
        if issubclass(type(action), GenericButtonAction):
            self._long_press_action = action
        else: self._long_press_action = DummyAction()

    def invert_logic(self, val):
        self._invert_logic = val

    # since the GPIO library is not able to distinguish between rising and falling edge when using the "BOTH" flag, needs to read the input level to understand if it low or high
    def button_change(self, pin):
        # importing here because this is a library that means something only for the pi, on other systems it won't be available
        try:
            import RPi.GPIO as GPIO
            if GPIO.input(self.pin) != self._invert_logic:      
                self._button_released()
            else: self._button_selected()
        except (RuntimeError, ModuleNotFoundError):
            self.app.logger.error("The GPIO library is not available on this device. Please use button_selected or button_released methods in place of button_change")
        except Exception as e:
            self.app.logger.exception(e)

    # private methods
    def _button_click(self):
        self.app.logger.debug("HW button pressed for action '{}'".format(self._click_action.label))
        self._click_action.execute()

    # optional method
    def _button_long_press(self):
        self.app.logger.debug("HW button long press for action '{}'".format(self._long_press_action.label))
        self._long_press_action.execute()

    # optional method
    # iteration: number of the tic
    def _button_long_press_tic(self, tic):
        self.app.logger.info("HW button tic {}".format(tic))
        self._long_press_action.tic(tic)

    # event called by the hw manager when the button is pressed down
    def _button_selected(self):
        self._selected_time = time()
        self._stop = False
        self._th = Thread(target = self._thf, daemon=True)
        self._th.name = "button_events"
        self._th.start()

    # event called by the hw manager when the button is released
    # will automatically use one between button_click or button_long_press according to the time delay set
    def _button_released(self):
        with self._mutex:
            self._stop = True
        self._th.join()

        if time() <= self._selected_time + self._long_time:
            self._button_click()

    # thread funtion that manage the tics
    def _thf(self):
        current_time = 0
        used_long_press = False
        tics = 1
        while(True):
            current_time = time()
            if (self._selected_time + self._long_time) < current_time: 
                if not used_long_press:
                    used_long_press = True
                    self._button_long_press()
                if current_time - self._selected_time - self._long_time > tics * self._tic_time + self._tic_delay:
                    self._button_long_press_tic(tics)
                    tics += 1
            
            with self._mutex:
                if self._stop:
                    break