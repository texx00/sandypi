import serial.tools.list_ports
import serial
import time
import sys

# This class connect to a serial device
# If the serial device request is not available it will create a virtual serial device


class DeviceSerial():
    def __init__(self, serialname = None, baudrate = None):
        self.serialname = serialname
        self.baudrate = baudrate
        self.is_fake = False
        self._buffer = bytearray()
        self.echo = ""
        try:
            args = dict(
                baudrate = self.baudrate,
                timeout = 0,
                write_timeout = 0
            )
            self.serial = serial.Serial(**args)
            self.serial.port = self.serialname
            self.serial.open()
            print("Serial device connected")
        except:
            #print(traceback.print_exc())
            self.is_fake = True
            print("Serial not available. Will use the fake serial")

    def send(self, obj):
        if self.is_fake:
            print("Fake> " + str(obj))
            self.echo = obj
            time.sleep(0.05)
        else:
            if self.serial.is_open:
                try:
                    while self.readline():
                        pass
                    self.serial.write(str(obj).encode())
                except:
                    self.close()
                    print("Error while sending a command")
    
    def serial_port_list(self):
        if sys.platform.startswith('win'):
            plist = serial.tools.list_ports.comports()
            ports = [port.device for port in plist]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            # this excludes your current terminal "/dev/tty"
            ports = glob.glob('/dev/tty[A-Za-z]*')
        else:
            raise EnvironmentError('Unsupported platform')
        return ports

    def is_connected(self):
        if(self.is_fake):
            return False
        return self.serial.is_open
    
    def close(self):
        try:
            self.serial.close()
            print("Serial port closed")
        except:
            print("Error: serial already closed or not available")
    
    def readline(self):
        if not self.is_fake:
            if self.serial.is_open:
                while self.serial.inWaiting():
                    line = self.serial.readline()
                    return line.decode(encoding='UTF-8')
        else:
            if not self.echo == "":
                echo = "ok"         # sends "ok" as ack otherwise the feeder will stop sending buffered commands
                self.echo = ""
                return echo
        return None
