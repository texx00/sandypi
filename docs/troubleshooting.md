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

## After the update the browser is stuck on a gray/white page

When updating from one version to another, for the moment, it may happen that the software get stuck on old data.

To fix the problem: 
 * clear the cache of the browser 

or
 * in the browser console (google -> how to open "browser name" javascript console) run the command `localStorage.clear()`

Then reload the page