from dotmap import DotMap

MARLIN = DotMap()
MARLIN.name = "Marlin"
MARLIN.ACK = "ok"
MARLIN.buffer_command = "M114"

def is_marlin(val):
    return val == MARLIN.name


GRBL = DotMap()
GRBL.name = "Grbl"
GRBL.ACK = "ok"
GRBL.buffer_command = "G0"

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