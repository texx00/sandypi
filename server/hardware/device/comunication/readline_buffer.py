class ReadlineBuffer:
    """
    This buffer handles the data received from the serial

    The received data is stored and the returned value is different than None only if
    there is a newline character
    """

    def __init__(self):
        self._buff = ""
        self._full_lines = []

    def update_buffer(self, new_bytes):
        """
        Update the buffer with the last received bytes

        Args:
            new_bytes: the freshly received bytes from the serial
        """
        if (new_bytes == "") or (new_bytes is None):
            return

        self._buff += new_bytes
        tmp = self._buff.split("\n")
        if len(tmp) > 1:
            # setting the buffer to use the last received line bit
            self._buff = tmp[-1]
            # adding current lines to the full list of lines to check
            self._full_lines += tmp[:-1]

    @property
    def full_lines(self):
        """
        Returns the list of full lines received and then will clear the list

        Returns:
            list of full lines that have been received
        """
        if len(self._full_lines) == 0:
            return []

        tmp = self._full_lines
        self._full_lines = []
        return tmp
