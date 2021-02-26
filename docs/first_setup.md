# First setup

When the server is running and after having succesfully connected to the main webpage, it's time to setup the connection with the table.
In the settings page it is necessary to setup the serial connection parameters (port and baudrate), the device type (at the moment only Cartesian or Scara types are supported) and the firmware version (tested only with Marlin and Grbl 1.1 but other type of firmwares may work as well).

After the device type selection it will be possible to select the dimension of the device and some options about the homing positions (Scara device only) required to generate an accurate preview of the drawing after it has been loaded.

In the "Scripts" section it is possible to setup some commands that may be necessary to run on connection with the board.
For example it may be necessary to home the axis and set a feedrate:
```
G28
G1 F30
```

Another example may be to reset the zero position after homing to move away from the limit switches:
```
G28
G0 X5 Y5
G92 X0 Y0
```

Now hit the save and connect and you are ready to [use](usage.md) the software.

___
<sup><sub>If you need help or something is not working feel free to open an issue. If you want to improve this page feel free to open a pull request ;)<sub><sup>
