# Installation with Docker

From Sandypi v0.6, Docker is the suggested way to install the software.
The installation is much easier, quicker and less prone to issues/problems during the installation process itself.
Nonetheless, it will be much easier to update the software after this step.

Unfortunately this installation is not compatible with the old installation method. (In order to keep the data from older versions it is possible to manually copy data from the actual installation folder into the volumes created after the docker installation. See [Volumes](volumes).)

**IMPORTANT! Docker and docker-compose must be already installed on your device to follow this procedure. Official procedures can be found [here (docker)](https://docs.docker.com/get-docker/) and [here (docker-compose)](https://docs.docker.com/compose/install/).**

## Download the docker-compose file

The [Docker image](https://hub.docker.com/repository/docker/texx00/sandypi) requires some specific setup to run.
To simplify this setup it is possible to use a docker-compose script that can be downloaded in two different ways:

- [from the command line](download-from-command-line)
- [from a web browser](download-from-browser)

### Download from command line

- open a terminal window (or connect through ssh to the device)
- use: `wget https://raw.githubusercontent.com/texx00/sandypi/master/docker/docker-compose.yml`

### Download from browser

- open [this link](https://github.com/texx00/sandypi/blob/master/docker/docker-compose.yml) in your browser
- on the top right there should be the `Raw` button: right-click on it and select `Save as ...`
- save the file where you can find it
- change the extension of the file from `.txt` to `.yml`

## Running the container

To create and run the container use (from within the same folder of the `docker-compose.yml` file):

```bash
$> docker-compose up -d
```

The containers are set to automatically start always unless stopped manually.

To stop it:

```bash
$> docker-compose down
```

## Using the software

Now, from every device on the network should be possible to reach the software by putting the ip address of the device in any browser with this format: `ip_address:5100`. The `5100` is the default port for Sandypi. It is also possible to change it. See [Changing port](changing-port) for more detailed instructions.

## Software updates

The provided docker-compose file is setting up not only Sandypi but also Watchtower. The latter, is capable of monitoring the availability of updates for the other images. This means that, if enabled, you will have always the latest available version of Sandypi running on your hardware.
Automatic software updates can be enabled in Sandypi settings through the interface.

To manually force an update it is possible to use:

```bash
$> docker-compose pull
$> docker-compose up -d
```

## Shared folders (Docker volumes)

In order to retain data between updates, the docker image is saving the data in some shared folders that are located outside the docker image (Docker volumes).

It may be necessary or useful to access some of these folders. For example, the data can be backed up to replace the sd card and mantain the same drawings and playlist in the new Pi image.

The structure is like this: "main_volume_folder" -> "volume_name" -> _data -> "the actual data"

To access the main volume folders:

- Windows: open "\\\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes" in Windows explorer
- Linux: open /var/lib/docker/volumes/

## Volumes

### Logs

This folder contains the server logs. These files can be helpful in understanding issues/problems with the software. It is advisable to attach these files to any new Github issue when a problem is reported to help in understanding what is its cause.

Another way to see the logs is to use `docker ps` to get the id of the container (a string of letters and numbers) and then:

```bash
$> docker logs <container_id>
```

### Autodetect

This folder is scanned periodically by the server: if one or more new drawings files are detected, they are uploaded automatically and will become available in the interface. It is possible to save directly the files here (also with automatic scripts) instead of uploading them by hand in the interface.

### Saves

Here the config files are saved. If necessary they can be modified by hand but should be easier to modify them by hand. The "saved_settings.json" file is regenerated from the "default_settings.json" if deleted (in case something goes wrong with the settings).

If the default flask environmental variables need to be changed, it is possible to load a `.env` file inside this folder. The file will be copied when the container is first started and the new values for the variables will be used. Check the `.env.template` file to see which variables can be changed. (The changes will be available only after the container is restarted.)

### Database

The database volume is used to save the SQL database. Nothing interesting here other than for backup reasons.

### Static

This folder contains the files that have been uploaded. This is interesting only for backups as per the database volume.

## Choosing a specific branch

Sandypi comes in different flavours. By default, the image running is the main/stable image. This means that by default you will be using the safer/most stable version of the software.

In case you want to try the alpha or beta versions of the software you just need to change one line in the docker-compose.yml file.

You will need to add `-alpha` or `-beta` in the image line (it is also possible to specify the version instead of using the `latest` version):

```yml
# Sandypi main image
sandypi:
  image: texx00/sandypi:latest
  restart: unless-stopped
  volumes:
    ...
```

```yml
# Sandypi beta image
sandypi:
  image: texx00/sandypi-beta:latest
  restart: unless-stopped
  volumes:
    ...
```

```yml
# Sandypi alpha image
sandypi:
  image: texx00/sandypi-alpha:latest
  restart: unless-stopped
  volumes:
    ...
```

## Changing port

It is also possible to change the port used by the software (the number `xxxx` to put after the ip address [`ip_address:xxxx`]).
Just change only the **first** number in the "ports" field inside the `docker-compose.yml` file.
By using 80:5000 it will not be necessary to specify the port anymore but the software will be reachable simply by putting the device's ip address in the browser address bar (no need for the `xxxx` number at the end).

***IMPORTANT:*** leave the number after the columns as 5000.

```yml
  sandypi:
   ports:
     - 80:5000
```
