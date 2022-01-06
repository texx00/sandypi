# Sandypi development

This page reports some details about developing and debugging the project.

## Installation

In order to start working on the project it is necessary to install the software manually, without docker.

Check the [installation procedure](old_installation.md) here.

## Visual Studio Code debugging setup

The project is developed with VS Code. It is possible to setup the debugger to run the flask server with some simple steps:

* create a launch.json file
* add a configuration
* select the Flask launch type
* insert "server" as the application name

If you want to test the connection also from other devices it is necessary to add the following line in the "args" section of the launch.json configuration:
`"--host=0.0.0.0"`
Without this additional option the server will be available only on the running device at `127.0.0.1:5000`

## Environmental variables

Development environmental variables can be set in the .env file (flask uses python-dotenv module to keep track of environmental variables).

Production environmental variables must be set in the .flaskenv file.

The .env file is not under source control. You can copy the .env.template file and set the variables as you need.

With VSCode is possible to set also "launch configuration" specific variables by setting them in the launch.json file in the 'env' section.

## Python dependencies

To update the requirements.txt file (necessary when a new python module is added to the environment) run the `update_requirements.bat`

If you are developing on linux you can find the correct pip freeze sequence inside that .bat file

***Important note:*** Be careful to use the install command with the "develop" option (`$> install.bat/sh develop`) to exclude the project itself from the list.

## Flask database

The project uses flask-migrate.
When the database requires a schema variation, it is necessary to use the `flask db migrate` command as explained in `UIserver/database.py`.

Flask migrate will not work on single playlists tables. If any change is done to their schema (in the server.database.playlist_elements_tables.py file), the migration script must be modified manually.

Flask-migrate is a powerful tool to manage the migration between versions automatically and allow to update from one version of the schema to another flawlessly

## Frontend

The frontend of the app is using *React*, *Redux* and *Bootstrap 4*. If you are not confortable with those check them out before having a look at the project.

To work on the frontend it is necessary to run the react server:

```bash
{main project folder}

$>cd frontend
$frontend>yarn start
```

The server will automatically open a new page and will compile the modified files automatically.
This server runs on port 3000.

During the installation of the software with the "install.bat/sh" script, the frontend will be built into a lighter/compressed code as a result of the `yarn build` command called inside the script.
For this reason, any change to the build folder is ignored and will be overwrite during the installation.

### Frontend and server separately

It is possible to run the server on the raspberry and the frontend development server on another computer (the raspberry can be slow to compile the frontend files).

To work like this, change the ip address of the REACT_DEVELOPMENT_SERVER variable inside frontend/.env.development


where `xxx.xxx.xxx.xxx` is the ip address of the remote machine.

## Compatibility

The software is intended to run primarily on a Raspberry Pi. For this reason, before mergin the pull requests, testing on that platform must be performed.

## Docker

From version v0.6, the project can be run on docker containers. Since the main target device for the software is Raspberry Pi, the image must be built compatible with the arm/v7 architecture. Check [how to build](../docker/build.md) in order to build and test an image compatible with Raspberri Pi hardware.

## How to help

If you have an idea code it and open a pull request or if you are unsure open an issue and we will discuss about it.

If you want to contribute but you don't know what to do, check the issues to find something that requires attention or open the project with an extension that allows you to see the "TODO" comments in the program. I do not copy all of them as issues but there may be something interesting there.
