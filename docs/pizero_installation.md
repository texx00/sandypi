# Raspberry Pi Zero W installation

This version of the board is not powerfull enough to build the software.
Still, it is possible to run Sandypi on the board with the following tricks.

## Method #1 (SUGGESTED - EASIEST)

It is possible to install the software on a Raspberry Pi 3/4 by following the standard installation guide and then put the programmed micro SD card on the Raspberry Pi Zero W.

Same process applies for the software updates: it is not possible to update directly on the Pi Zero W but it will be necessary to run the update on a Pi 3/4 and then move the micro SD card back to the Pi Zero W.

## Method #2

If another Raspberry Pi board is not available it is still possible to perform the installation with the following method.

 * Perform the installation by following the standard procedure but use `install_zero.sh` in place of the `install.sh` script.

 * Perform the full installation on a computer

 * Copy the `./frontend/build` folder from the computer to the same location on the Pi Zero W.

 * Try the server by running the start command:
    ```
        (env) $> sudo python3 start.py
    ```

*Note*: it is not necessary to install `Nodejs` or `npm` in this case.


To update the software use `(env) $> git pull` before using the same installation procedure on both the Pi Zero W and the computer used for the build.

## Method #3 (Not available yet)

In the future it will be possible to create a dedicated image for the Pi Zero W to simplify the installation.

This though will not allow for updates because when the new image is loaded, all the data from before is lost. We will need to figure out a way to backup data between versions.
Also, will require to create a new image every version is released, which is not suitable at the moment: the software is still changing a lot and updates are frequent thus it is not a good idea to keep building images. Maybe when the software stabilize it will be possible to implement this method.

