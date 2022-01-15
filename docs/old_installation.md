# Old installation procedure

This procedure is not supported anymore.
Can be used only for development purposes. Check the [new installation procedure](../docker/readme.md).

## Windows

Install python 3.7 or above together with pip, npm and git and restart your computer to make the commands available system wide.

Open cmd and install virtual env as:

```bash
$> python -m pip install virtualenv
```

Download the repo with:

```bash
$> git clone https://github.com/texx00/sandypi.git
```

Open the sandypi folder, create a new virtual environment and activate it:

```bash
$> cd sandypi
$> python -m venv env
$> \env\Scripts\activate.bat

(env)$> 
```

Now you can install SandyPi (will take a while):

```bash
(env)$> install.bat
```

If the software is being installed for development purposes it is necessary to use this command instead:

```bash
(env) $> install.bat develop
```

## Raspbian OS (Buster and above)

Make sure on your system git, npm, pip and virtualenv are already available:

```bash
$> sudo apt-get install git python3-pip npm
$> sudo pip3 install virtualenv
```

To avoid possible problems when the server is running install also the libopenjp2-7 and libtiff5 packages:

```bash
$> sudo apt-get install libopenjp2-7 libtiff5
```

Download the repo with:

```bash
$> git clone https://github.com/texx00/sandypi.git
```

Open the sandypi folder, create a new virtual environment and activate it:

```bash
$> cd sandypi
$> virtualenv env
$> source env/bin/activate

(env)$> 
```

Now you can install SandyPi (will take a while):

```bash
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

Follow the [guide](first_setup.md) for your first setup or for [more info about the usage](usage.md)

## Autodetect drawings

The software will automatically load (`.gcode`) files positioned in the `server/autodetect` folder.
The file will be automatically deleted from the folder once loaded.

## Troubleshooting

[Here](old_troubleshooting.md) is available a small guide to troubleshoot the old installation method.

## Updates

The software will prompt weekly if a new tag version has been added.
The tagged version should be more or less stable.
Mid-tags commits may not be stable (for this reason the software will not notify these updates).

To update to the last available version of the software in linux you can run the following commands:

```bash
$> source env/bin/activate
(env) $> git pull
(env) $> sudo sh install.sh
```

If you are working on Windows you should use instead:

```bash
$> source env/bin/activate
(env) $> git pull
(env) $> install.bat
```

If you have problems after the update check the [troubleshooting](old_troubleshooting.md) guide.
