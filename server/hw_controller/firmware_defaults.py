from dotmap import DotMap

MARLIN = DotMap()
MARLIN.name = "Marlin"
MARLIN.ACK = "ok"
MARLIN.buffer_command = "M114"
MARLIN.emergency_stop = "M112"
MARLIN.buffer_timeout = 30
MARLIN.ready_message = "start"
MARLIN.position_tolerance = 0.01

def is_marlin(val):
    return val == MARLIN.name


GRBL = DotMap()
GRBL.name = "Grbl"
GRBL.ACK = "ok"
GRBL.buffer_command = "?"
GRBL.emergency_stop = "!"
GRBL.buffer_timeout = 5
GRBL.ready_message = "Grbl"

def is_grbl(val):
    return val == GRBL.name


def get_ACK(firmware):
    if firmware == MARLIN.name:
        return MARLIN.ACK
    else: return GRBL.ACK
    
def get_buffer_command(firmware):
    if firmware == MARLIN.name:
        return MARLIN.buffer_command
    else: return GRBL.buffer_command

def get_buffer_timeout(firmware):
    if firmware == MARLIN.name:
        return MARLIN.buffer_timeout
    else: return GRBL.buffer_timeout

def get_emergency_stop_command(firmware):
    if firmware == MARLIN.name:
        return MARLIN.emergency_stop
    else: return GRBL.emergency_stop

def get_ready_message(firmware):
    if firmware == MARLIN.name:
        return MARLIN.ready_message
    else: return GRBL.ready_message