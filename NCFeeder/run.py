from socketio_interface import SocketInterface
import socketio
from feeder import Feeder
from pid import PidFile
from time import sleep
import traceback
import atexit

pidname = "feeder.pid"

try:
    with PidFile(pidname) as p: # check if the process is already running using pid files. If it is already running will restart it
              
        sioif = SocketInterface()
        
        @atexit.register
        def at_exit():
            sioif.at_exit()
        # Wait for any event
        while True:
            pass
except:
    print(traceback.print_exc())
    sleep(5)