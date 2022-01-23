from abc import abstractmethod, ABC


class FirwmareEventHandler(ABC):
    """
    Event handler for line sent and received from the serial device
    """

    @abstractmethod
    def on_line_sent(self, line):
        """
        Called when a new line has been sent to the serial device
        """

    @abstractmethod
    def on_line_received(self, line):
        """
        Called when a new line has been received to the serial device
        """
