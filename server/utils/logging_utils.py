from logging import Formatter
import logging
from logging.handlers import RotatingFileHandler, QueueHandler, QueueListener
from queue import Queue
from multiprocessing import RLock

# https://rob-blackbourn.medium.com/how-to-use-python-logging-queuehandler-with-dictconfig-1e8b1284e27a
log_queue = Queue(-1)
log_queue_handler = QueueHandler(log_queue)

# creating a custom multiprocessing rotating file handler
# https://stackoverflow.com/questions/32099378/python-multiprocessing-logging-queuehandler-with-rotatingfilehandler-file-bein
class MultiprocessRotatingFileHandler(RotatingFileHandler):
    def __init__(self, *kargs, **kwargs):
        super(MultiprocessRotatingFileHandler, self).__init__(*kargs, **kwargs)
        self.lock = RLock()

    def shouldRollover(self, record):
        with self.lock:
            super(MultiprocessRotatingFileHandler, self).shouldRollover(record)

# fixme the rotating file handler is not working for some reason. should find a different solution. Create a new log file everytime the table is turned on? The file should be cached for some iterations? (5?)

# create a common formatter for the app
formatter = Formatter("[%(asctime)s] %(levelname)s in %(name)s (%(filename)s): %(message)s")

server_file_handler = MultiprocessRotatingFileHandler("server/logs/server.log", maxBytes=2000000, backupCount=5)
server_file_handler.setLevel(1)
server_file_handler.setFormatter(formatter)

server_stream_handler = logging.StreamHandler()
server_stream_handler.setLevel(logging.INFO)
server_stream_handler.setFormatter(formatter)

queue_listener = QueueListener(log_queue_handler, server_file_handler, server_stream_handler)
queue_listener.start()