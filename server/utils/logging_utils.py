from logging import Formatter
import logging
from logging.handlers import RotatingFileHandler, QueueHandler, QueueListener
from queue import Queue
from multiprocessing import RLock
import shutil

# creating a custom multiprocessing rotating file handler
# https://stackoverflow.com/questions/32099378/python-multiprocessing-logging-queuehandler-with-rotatingfilehandler-file-bein
class MultiprocessRotatingFileHandler(RotatingFileHandler):
    def __init__(self, *kargs, **kwargs):
        super(MultiprocessRotatingFileHandler, self).__init__(*kargs, **kwargs)

    # not sure why but the .log file was seen already open when it was necessary to rotate to a new file.
    # instead of renaming the file now I'm copying the entire file to the new log.1 file and the clear the original .log file
    # this is for sure not the best solution but it looks like it is working now
    def rotate(self, source, dest):
        shutil.copyfile(source, dest)
        f = open(source, 'r+')
        f.truncate(0)

# FIXME the rotating file handler is not working for some reason. should find a different solution. Create a new log file everytime the table is turned on? The file should be cached for some iterations? (5?)

# create a common formatter for the app
formatter = Formatter("[%(asctime)s] %(levelname)s in %(name)s (%(filename)s): %(message)s")

server_file_handler = MultiprocessRotatingFileHandler("server/logs/server.log", maxBytes=2000000, backupCount=5)
server_file_handler.setLevel(1)
server_file_handler.setFormatter(formatter)

server_stream_handler = logging.StreamHandler()
server_stream_handler.setLevel(logging.INFO)
server_stream_handler.setFormatter(formatter)