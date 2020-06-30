from socketio_interface import SocketInterface
import socketio
from feeder import Feeder
from pid import PidFile
from time import sleep
import traceback

pidname = "feeder.pid2"

try:
    with PidFile(pidname) as p: # check if the process is already running using pid files. If it is already running will restart it
              
        sioif = SocketInterface()

        # Wait for any event
        while True:
            pass
except:
    print(traceback.print_exc())
    sleep(5)