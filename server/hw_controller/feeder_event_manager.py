from server.hw_controller.feeder import FeederEventHandler
import time

class FeederEventManager(FeederEventHandler):
    def __init__(self, app):
        super().__init__()
        self.app = app
        self.last_send_time = time.time()
        self.command_index = 0

    def on_element_ended(self, element):
        self.app.logger.info("B> Drawing ended")
        self.app.semits.show_toast_on_UI("Element ended")
        self.app.qmanager.set_is_drawing(False)
        self.app.qmanager.start_next()
        if self.app.qmanager.is_queue_empty():
            self.app.qmanager.send_queue_status()

    def on_element_started(self, element):
        self.app.logger.info("B> Drawing started")
        self.app.semits.show_toast_on_UI("Element started")
        self.app.qmanager.set_element(element)
        self.app.qmanager.send_queue_status()
        self.command_index = 0
    
    def on_message_received(self, line):
        # Send the line to the server
        self.app.semits.hw_command_line_message(line)

    def on_new_line(self, line):
        # Throttle down the commands sent to the frontend otherwise it will get the frontend stuck on the computation
        # Avoid sendind every message, send them every maximum 0.5s (if they are fast, a set difference should not change much in the drawing preview)
        if time.time() - self.last_send_time > 0.01 or self.command_index < 16:
            # use the command index to track the first commands until the buffer is full
            self.command_index += 1
            # update timer
            self.last_send_time = time.time()
            # Send the line to the server
            self.app.semits.update_hw_preview(line)