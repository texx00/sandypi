# SandyPi

A python program to feed your automatic zen table with a fresh design everyday

## The idea

Zen tables are beautiful but I don't like to see always the same design on the sand: I wanted to have a fresh design waiting me every morning at caffee time.

The program can run on a raspberry pi connected to your zen table and change the design over night.
You can control the drawings via the web interface from your device connected to the network (smartphone, tablet or computer independently thanks to the web interface).

Upload your designs, create ordered playlists or let the software randomly decide your next design.

The final aim of the project is to create something like a social network to share your designs and to collect designs from others to get everyday (or even twice a day :)) a new fresh design on your table.

# Installation

## Raspbian OS

Make sure on your system git, pip and virtualenv are already available:

```
$> sudo apg-get install git python3-pip
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
(env)$> sudo pip3 install -r "requirements.txt"
(env)$> sudo python3 setup.py install
```

## Running the server

To run the server use:
`(env)$> python3 start.py`

# Project status

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

In a far far away future:
* [ ] Create a social network to share designs and update your personal playlists

Todos:
* [ ] Create logo
* [ ] Create favicon
* [ ] Create a setup script and a bash script to automatize the installation (i.e. install pip, venv, create venv, start the setup)
* [ ] Run the server not on a production server
* [ ] Upload of multiple files at once
* [ ] Create preview of the gcode as an image when the file is loaded
* [ ] Possibility to modify the settings of the single file and save them in the gcode as comments?
* [ ] Create a playlist for "cleanup" drawings with some defaults