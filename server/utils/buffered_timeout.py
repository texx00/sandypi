from threading import Thread, Lock
import time

# this thread calls a function after a timeout but only if the "update" method is not called before that timeout expires

class BufferTimeout(Thread):
    def __init__(self, timeout_delta, function, group=None, target=None, name=None, args=(), kwargs=None):
        super(BufferTimeout, self).__init__(group=group, target=target, name=name)
        self.name = "buffered_timeout"
        self.timeout_delta = timeout_delta
        self.callback = function
        self.mutex = Lock()
        self.is_running = False
        self.setDaemon(True)
        self.update()
    
    def set_timeout_period(self, val):
        self.timeout_delta = val

    def update(self):
        with self.mutex:
            self.timeout_time = time.time() + self.timeout_delta

    def stop(self):
        with self.mutex:
            self.is_running = False

    def run(self):
        self.is_running = True
        while self.is_running:
            with self.mutex:
                timeout = self.timeout_time
            current_time = time.time()
            if current_time > timeout:
                self.callback()
                self.update()
                with self.mutex:
                    timeout = self.timeout_time
            time.sleep(timeout - current_time)
