# SandyPi

A python program to feed your automatic zen table with a fresh design everyday

## The idea

Zen tables are beautiful but I don't like to see always the same design on the sand: I wanted to have a fresh design waiting me every morning at coffee time.

The program can run on a raspberry pi connected to your zen table and change the design over night.
You can control the drawings via the web interface from your device connected to the network (smartphone, tablet or computer independently thanks to the web interface).

Upload your designs, create ordered playlists or let the software randomly decide your next design.

The final aim of the project is to create something like a social network to share your designs and to collect designs from others to get everyday (or even at everytime :)) a new fresh design on your table.

## The project

The aim of the project is to create something focused on the sandtables. For sure, other solution exist (like octoprint) but their aim is for 3D printers thus the experience on a sandtable can be optimized.
The project is really immature and barely usable at the moment, see it as a preview of what it can become.

The project is opensource under MIT license and thus anyone can help (there is so much to do).

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

Now you can install SandyPi (will take a while):
```
(env)$> sh install.sh
```

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

# Installation troubleshooting

If you find problems during the installation check the [troubleshooting](/docs/troubleshooting.md) page

**If you find any bug or problem please feel free to open an [issue](https://github.com/texx00/sandypi/issues) in the dedicated page.**
___

# Updates

The software will prompt weekly if a new tag version has been added.
The tagged version should be stable.
Mid-tags commits may not be stable (for this reason the software will not notify these updates).

To update to the last available version of the software in linux you can run the following commands:

```
$> source env/bin/activate
(env) $> git pull
(env) $> sh install.sh
```

If you are working on Windows you should use instead:

```
$> source env/bin/activate
(env) $> git pull
(env) $> install.bat
```

If you have problems after the update check the [troubleshooting](/docs/troubleshooting.md) guide.

# Development and testing

Any help in the app development is accepted.
Also testing the software counts! If you find any bug or you have any idea just check if an issue is already open for that topic or open it yourself.
For the coding, debugging and so on check the [development section](/docs/development.md).
In this case, during the installation it is necessary to run `(env) $> install.bat develop`.


# Current status

The project is really primitive and need a lot of work.
For the moment it is possible to connect to a device parsing GCODE (tests have been done on ramps 1.4 running Marlin), load some gcode files, create playlists, run a single program, run a playlist.

Here is a brief list of features that are already available or may be implemented in the future:
* [x] Web interface to be accessible from different devices
* [x] Upload locally your design
* [x] Create playlists and manage the designs
* [x] Feed the table when you want
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
* [ ] Run the server not on a production server
* [x] Upload of multiple files at once
* [ ] Show the realtime gcode simulation with time estimate (on a live page?)
* [ ] Possibility to modify the settings of the single file and save them in the gcode as comments?
* [ ] Create a playlist for "cleanup" drawings with some defaults
* [ ] A lot more stuff... Just ask to know what you can help with

## Versions
Check the latest version infos [here](docs/versions.md)