# Installation troubleshooting

## pyserial errors

It may happen that the serial port is not working correctly.
In this case activate the environment, uninstall the "serial" and the "pyserial" modules and install again the "pyserial":
```
$> source env/bin/activate
(env) $> python3 -m pip uninstall serial pyserial
(env) $> python3 -m pip install pyserial
```

## "Serial not available. Will use fake device"

The previous message may appear on the command line while running the program.
This is a normal behaviour on the first run because it is necessary to select the serial device to connect from the UI.

Open your browser, put ip:5000 and open the settings page (button on the top right corner) and select the serial port and baudrate.

## The server starts but cannot connect to it from the browser

Check if npm is installed correctly with the command `npm -v`. If it is not, install it and then run again the `install.bat/sh` script

## After the update the browser is stuck on a gray/white page

When updating from one version to another, for the moment, it may happen that the software get stuck on old data.

To fix the problem: 
 * clear the cache of the browser 

or
 * in the browser console (google -> how to open "browser name" javascript console) run the command `localStorage.clear()`

Then reload the page

## Still no solution?

If the previous suggestions didn't help you open an issue.
Please specify:
* operating system
* server device (PC, Raspberry version, ...)
* firmware (Marlin, Grbl, ...)
* The issue
* add a copy of the terminal result you get during the installation and when after running the software in orded to analyze better the problem
