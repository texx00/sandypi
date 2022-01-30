from collections import deque
from threading import RLock, Lock

from server.utils import limited_size_dict


class CommandBuffer:
    def __init__(self, max_length=8):
        """
        Args:
            max_length (int): the maximum number of messages that can be sent in a row without receiving acks
        """
        # this lock is used to check if the buffer is full
        # if the mutex is locker means that must wait before sending a new line
        self._send_mutex = Lock()
        # this lock is just to access the buffer
        self._mutex = RLock()
        # command buffers
        self._buffer = deque()
        # max number of messages
        self._buffer_max_length = max_length
        # keep saved the last n commands (this will be helpfull for marlin)
        self._buffer_history = limited_size_dict.LimitedSizeDict(
            size_limit=self._buffer_max_length + 40
        )

    def is_empty(self):
        """
        Returns:
            True if the buffer is empty
        """
        return len(self._buffer) > 0

    def get_buffer_wait_mutex(self):
        """
        Returns:
            send_mutex: the mutex is locked if the buffer is full and cannot send more commands
        """
        return self._send_mutex

    def push_command(self, command, line_number, no_buffer=False):
        """
        Args:
            command: the command that must be buffered
            line_number: the line number to be buffered
            no_buffer: if False, will not make the buffer longer (used with the control commands)
        """
        with self._mutex:
            self._buffer.append(line_number)
            self._buffer_history[f"N{line_number}"] = command
            if no_buffer:
                self._buffer.popleft()  # remove an element to get a free ack from the non buffered command. Still must keep it in the buffer in the case of an error in sending the line

            if len(self._buffer) >= self._buffer_max_length and not self._send_mutex.locked():
                self._send_mutex.acquire()  # if the buffer is full acquire the lock so that cannot send new lines until the reception of an ack. Notice that this will stop only buffered commands. The other commands will be sent anyway

    def clear(self):
        """
        Clear the buffer
        """
        with self._mutex:
            self._buffer.clear()

    def ack_received(self, safe_line_number=None, append_left_extra=False):
        """
        This method must be called when a new ack has been received
        Clear the oldest sent command in order to free up space in the buffer

        Args:
            safe_line_number: if set, will delete all the commands older than the given line number
            append_left_extra: adds extra entry (should be used together with safe_line_number)
        """
        with self._mutex:
            if safe_line_number is None:
                if len(self._buffer) != 0:
                    self._buffer.popleft()
            else:
                while True:
                    # Remove the numbers lower than the specified safe_line_number (used in the resend line command: lines older than the one required can be deleted safely)
                    if len(self._buffer) != 0:
                        line_number = self._buffer.popleft()
                        if line_number >= safe_line_number:
                            self._buffer.appendleft(line_number)
                            break
                if append_left_extra:
                    self._buffer.appendleft(safe_line_number - 1)

            self.check_buffer_mutex_status()

    def check_buffer_mutex_status(self):
        """
        Check if the send lock must be released
        """
        with self._mutex:
            if self._send_mutex.locked() and len(self._buffer) < self._buffer_max_length:
                self._send_mutex.release()
