class FeederEventHandler:
    """
    Handle the event calls from the feeder
    This is just a base class, every method is empty
    Need to implement this in a custom event handler
    """

    def on_element_ended(self, element):
        """
        Used when a drawing is finished

        Args:
            element: the element that was ended
        """
        pass

    def on_element_started(self, element):
        """
        Used when a drawing is started

        Args:
            element: the element that was started
        """
        pass

    def on_message_received(self, line):
        """
        Used when the device send a message that must be sent to the frontend

        Args:
            line: the line received from the device
        """
        pass

    def on_new_line(self, line):
        """
        Used when a new line is passed to the device

        Args:
            line: the line sent to the device
        """
        pass

    def on_device_ready(self):
        """
        Used when the connection with the device has been done and the device is ready
        """
        pass
