import inspect

from server import app
from server.hw_controller.buttons.generic_button_event import GenericButtonAction
import server.hw_controller.buttons.actions as button_actions

def test_buttons_get_options():
    options = app.bmanager.get_buttons_options()
    fields = ["description", "label", "name", "usage"]
    for o in options:
        for f in fields:
            if not f in o.keys():
                assert(False)
        if o["description"] == GenericButtonAction.description or o["label"] == GenericButtonAction.label:
            assert(False)

def test_buttons_gpio_available():
    assert(not app.bmanager.gpio_is_available())            # the test must pass on a linux device not using real hw

# checking if the button actions are created correctly and also if the execute method has been overwritten 
def test_buttons_action_has_execute():
    for cl in inspect.getmembers(button_actions, inspect.isclass):
        if not cl[1] is GenericButtonAction:
            print(cl[0])
            a = cl[1](app)
            a.execute()
