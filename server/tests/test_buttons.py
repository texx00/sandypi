
from server import app
from server.hw_controller.buttons.generic_button_event import GenericButtonEvent

def test_get_button_options():
    try:
        options = app.bmanager.get_buttons_options()
        fields = ["description", "label", "name"]
        for o in options:
            for f in fields:
                if not f in o.keys():
                    assert(False)
            if o["description"] == GenericButtonEvent.description or o["label"] == GenericButtonEvent.label:
                assert(False)
    except:
        assert(False)
    assert(True)