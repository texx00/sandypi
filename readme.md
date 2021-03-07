# SandyPi

A python program to feed your automatic zen table with a fresh design everyday

## The idea

Zen tables are beautiful but I don't like to see always the same drawing on the sand: I would like to have a fresh design waiting for me every morning at coffee time.

The program can run on a Raspberry Pi connected to your zen table and change the drawing overnight.
You can control the drawings through the web interface from your device connected to the network (smartphone, tablet or computer independently thanks to the web interface).

Upload your designs, create ordered playlists or let the software randomly choose your next design.

The final aim of the project is to create something similar to a social network to share your drawings and to collect designs from others to get everyday a fresh design on your table.

## The project

The aim of the project is to create something focused on the sandtables. For sure, other solution exist (like octoprint) but their aim is for 3D printers thus the experience is not optimized for this application.
The project is really immature and barely usable at the moment, see it as a preview of what it can become.

The project is opensource under MIT license and thus anyone can help (there is so much to do!).

# Some screenshots

![Main page](docs/images/preview.png)
![Playlist](docs/images/playlist.png)
![Drawing](docs/images/drawing.png)
![Manual](docs/images/control.png)

# Installation

## Windows

Install python 3.7 or above together with pip, npm and git and restart your computer to make the commands available system wide.

Open cmd and install virtual env as:
`$> python -m pip install virtualenv`

Download the repo with:

`$> git clone https://github.com/texx00/sandypi.git`

Open the sandypi folder, create a new virtual environment and activate it:

```
$> cd sandypi
$> python -m venv env
$> \env\Scripts\activate.bat

(env)$> 
```

Now you can install SandyPi (will take a while):
```
(env)$> install.bat
```

## Raspbian OS (Buster and above)

Make sure on your system git, npm, pip and virtualenv are already available:

```
$> sudo apt-get install git python3-pip npm
$> sudo pip3 install virtualenv
```

To avoid possible problems when the server is running install also the libopenjp2-7 and libtiff5 packages:

`
$> sudo apt-get install libopenjp2-7 libtiff5
`

Download the repo with:

`$> git clone https://github.com/texx00/sandypi.git`

Open the sandypi folder, create a new virtual environment and activate it:

```
$> cd sandypi
$> virtualenv env
$> source env/bin/activate

(env)$> 
```

Now you can install SandyPi (will take a while):
```
(env)$> sudo sh install.sh
```

This step may be long (even over 1h).

## Running the server

To run the server use:
`$> python start.py`
When running on linux use `python3` instead of `python`.

The script will activate the environment automatically.

The service can be stopped with `CTRL+C`

It is possible to set the server to start automatically when the device turns on with `$> python start.py -a=on`

To stop the server starting automatically use `$> python start.py -a=off`


## Web interface

Once the service is running it is possible to connect through a browser by typing the device ip address and connecting to the port 5000 like `192.168.1.15:5000`
If you are running on the local device you can also use `127.0.0.1:5000`

Follow the [guide](/docs/first_setup.md) for your first setup or for [more info about the usage](/docs/usage.md)

# Installation troubleshooting

If you find problems during the installation check the [troubleshooting](/docs/troubleshooting.md) page

**If you find any bug or problem please feel free to open an [issue](https://github.com/texx00/sandypi/issues) in the dedicated page.**
___

# Boards and firmwares
At the moment, the software is tested only with Marlin 2.0 and Grbl 1.1
Should be compatible with other firmwares as well. If not please open an issue.

The software has been built succesfully on Windows and Raspbian OS (running on Raspberry pi 3 B+ or 4).

Raspberry Pi Zero W can be used but it is necessary to follow [this guide](/docs/pizero_installation.md)

## Marlin 2.0 setup
In the settings select the serial port, the correct baudrate (usually 115200 or 250000) and the correct firmware type.

## Grbl 1.1
In the settings select the serial port, the correct baudrate (usually 115200 or 250000) and the correct firmware type.


# Updates

The software will prompt weekly if a new tag version has been added.
The tagged version should be more or less stable.
Mid-tags commits may not be stable (for this reason the software will not notify these updates).

To update to the last available version of the software in linux you can run the following commands:

```
$> source env/bin/activate
(env) $> git pull
(env) $> sudo sh install.sh
```

If you are working on Windows you should use instead:

```
$> source env/bin/activate
(env) $> git pull
(env) $> install.bat
```

If you have problems after the update check the [troubleshooting](/docs/troubleshooting.md) guide.

_____
*NOTE:* the software is still in **ALPHA** which means lots of features may not work as expected. Updates may fix some but may also introduce more bugs. If you find any please open an issue. One the fundaments of the software are ready a stable branch will be released with more stable updates.
____


# Development and testing

Any help in the app development is accepted.
Also testing the software counts! If you find any bug or you have any idea just check if an issue is already open for that topic or open it yourself.
For the coding, debugging and so on check the [development section](/docs/development.md).
In this case, during the installation it is necessary to run `(env) $> install.bat develop`.


# Current status

The project is really primitive and need a lot of work.
Here is a brief list of what the software is capable of and what will be implemented for sure in the future:
* [x] Web interface to be accessible from different devices over the network
* [x] Connection to the hardware controller through serial
* [x] Simple installation script to simplify the installation
* [x] Run the application on a single page with full js frontend and python (flask) backend
* [x] Upload locally your designs (with a preview as well) to keep them all in the same place
* [x] Create playlists and manage the designs
* [x] Run a drawing whenever you want
* [x] Run gcode commands manually
* [x] Feed the table periodically
* [ ] Shuffle mode to play shuffled drawings continuosly
* [ ] Simple lights/led control
* [ ] Update the software with a single button
* [ ] Create logo
* [ ] Run the server not on a production server
* [ ] Show the realtime gcode simulation with time estimate
* [ ] Advanced lights controls: syncronization between lights ant ball
* [ ] Sandify "integration" (like upload a drawing directly from sandify or modify an uploaded drawing)?
* [ ] A lot more stuff... Just ask to know what you can help with

In a far far away future:
* [ ] Create a social network to share designs and update your personal playlists

## Versions
Check the latest version infos [here](docs/versions.md)
