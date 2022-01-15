# Installation troubleshooting

## pyserial errors

It may happen that the serial port is not working correctly.
In this case activate the environment, uninstall the "serial" and the "pyserial" modules and install again the "pyserial":

```bash
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

## The server starts but cannot connect to it from the browser #2

Check if during the installation there was this error right before the line in bold.

```bash
$ react-scripts build
/bin/sh: 1: react-scripts: not found
error Command failed with exit code 127.
Info Visit https://...


----- Upgrading database -----
```

If this is the case, check to have a good internet connection during the installation. The installation script needs to download some libraries.

During that phase of the installation there is significant number of packets to download. Check if the progress reached the end of the line is reached correctly.

If the process is not conclued because of the connection keep on trying: the already downloaded packages are cached thus it will only download the missing ones.

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
