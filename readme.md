# SandyPi

A python program to feed your automatic zen table with a fresh design everyday

## The idea

Zen tables are beautiful but I don't like to see always the same design on the sand: I wanted to have a fresh design waiting me every morning at caffee time.

The program can run on a raspberry pi connected to your zen table and change the design over night.
You can control the drawings via the web interface from your device connected to the network (smartphone, tablet or computer independently thanks to the web interface).

Upload your designs, create ordered playlists or let the software randomly decide your next design.

The final aim of the project is to create something like a social network to share your designs and to collect designs from others to get everyday (or even twice a day :)) a new fresh design on your table.

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
$> virtualenv env
$> \env\Scripts\activate.bat

(env)$> 
```

Now you can install SandyPi:
```
(env)$> python -m pip install -r "requirements.txt"
(env)$> python setup.py install
```


## Raspbian OS

Make sure on your system git, npm, pip and virtualenv are already available:

```
$> sudo apg-get install git python3-pip npm
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

Now you can install SandyPi:
```
(env)$> sudo python3 -m pip install -r requirements.txt
(env)$> sudo python3 setup.py install
```

It may happen that the flask_socketio and flask_sqlalchemy are not installed correctly. Try to install them manually with:
```
(env)$> sudo pip3 install flask_socketio flask_sqlalchemy
(env)$> sudo python3 setup.py install
```

## Running the server

To run the server use:
`(env)$> sudo python3 start.py`

The service can be stopped with `CTRL+C`

At the moment the server do not starts automatically when the device turns on.

## Visual Studio Code debugging setup

The project is developed with VS Code. It is possible to setup the debugger to run the flask server with some simple steps:
* create a launch.json file
* add a configuration
* select the Flask launch type
* insert "UIServer" as the application name

If you want to test the connection also from other devices it is necessary to add the following line in the "args" section of the launch.json configuration:
`"--host=0.0.0.0"`
Without this additional option the server will be available only on the running device at `127.0.0.1:5000`

To see the NCFeeder terminal windows it is possible to add an environment variable: `"SHOW_FEEDER_TERMINAL" : "true"`
If the variable is added to the 'launch.json' configuration file (in the 'env' section) it will run only for the selected configuration

While coding the NCFeeder part, it is possible to set the `RUN_FEEDER_MANUALLY : "true"` environment variable. This variable stops the server to start automatically the NCFeeder process. The process can be started manually with: ```(env)> python NCFeeder/run.py```

**IMPORTANT NOTE:** vscode debugger do not send the SIGKILL and for this reason the feeder process is not stopped automatically. To kill the subprocess it is necessary to use CTRL+C in the terminal window. When working on the NCFeeder it may be easier to let the server alive and refresh just the feeder script by setting the RUN_FEEDER_MANUALLY variable.

## Web interface

Once the service is running it is possible to connect through a browser by typing the device ip address and connecting to the port 5000 like `192.168.1.15:5000`
If you are running on the local device you can also use `127.0.0.1:5000`

# Project status

There is a lot to do and I do not have much time. Any help will be accepted.

## Features 

Here is a list of features (already available or for future enhancements):
* [x] Web interface to be accessible from different devices
* [x] Upload locally your design
* [ ] Create playlists and manage the designs
* [ ] Feed the table when you want
* [ ] Feed the table periodically
* [ ] Guests that can control the table
* [ ] Raspberry as hotspot to which connect with a qrcode
* [ ] Lights/led control
* [ ] Make it nice
* [ ] Create groups of drawings to be drawn one after the other to create complex designs
* [ ] Create a tool to merge different drawings into one file
* [ ] Run the application on a single page with full js frontend

In a far far away future:
* [ ] Create a social network to share designs and update your personal playlists

Todos:
* [ ] Create logo
* [ ] Connection management with the table / table settings
* [ ] Run the server not on a production server
* [ ] Upload of multiple files at once
* [ ] Show the realtime gcode simulation with time estimate (on a live page?)
* [ ] Possibility to modify the settings of the single file and save them in the gcode as comments?
* [ ] Create a playlist for "cleanup" drawings with some defaults
* [ ] Start the server automatically at device boot (create a script to activate/deactivate this function)