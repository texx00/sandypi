from logging import Formatter
import logging
from logging.handlers import RotatingFileHandler

# create a common formatter for the app
formatter = Formatter("[%(asctime)s] %(levelname)s in %(name)s (%(filename)s): %(message)s")

server_file_handler = RotatingFileHandler("server/logs/server.log", maxBytes=2000000, backupCount=5)
server_file_handler.setLevel(1)
server_file_handler.setFormatter(formatter)

server_stream_handler = logging.StreamHandler()
server_stream_handler.setLevel(logging.INFO)
server_stream_handler.setFormatter(formatter)