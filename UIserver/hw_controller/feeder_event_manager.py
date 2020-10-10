from UIserver.hw_controller.feeder import FeederEventHandler


class FeederEventManager(FeederEventHandler):
    def __init__(self, app):
        super().__init__()
        self.app = app

    def on_drawing_ended(self, code):
        print("S> Sending drawing ended")
        self.app.logger.info("B> Drawing ended")
        self.app.semits.show_toast_on_UI("Drawing ended")
        # nav_drawing_request()             # TODO update interface
        self.app.qmanager.set_is_drawing(False)
        self.app.qmanager.start_next()

    def on_drawing_started(self, code):
        self.app.logger.info("B> Drawing started")
        self.app.semits.show_toast_on_UI("Drawing started")
        self.app.qmanager.set_code(code)
        # nav_drawing_request()             # TODO update interface
    
    def on_message_received(self, line):
        # Send the line to the server
        self.app.semits.hw_command_line_message(line)

    def on_new_line(self, line):
        # Send the line to the server
        self.app.semits.update_hw_preview(line)