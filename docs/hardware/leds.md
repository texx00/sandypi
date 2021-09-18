# LEDs

## Compatible LEDs

At the moment, it is possible to use WB2812B (or SK6812) compatible led strips both in RGB and RGBW format.

It is also possible to use dimmable single color leds (PWM driven).

## Installation

The software can handle different type of leds.
If digital leds are used, it is necessary to disable the audio module since it is using the same gpio channels used for controlling the LEDs. The following steps may be necessary:
- create the file `/etc/modprobe.d/snd-blacklist.conf` fill it with the following line: `blacklist snd_bcm2835`
- if the snd_bcm2835 is present also inside the `/etc/modules` file comment it out with the `#` character
- when running a headless setup check the `/boot/config.txt` file and add the following lines and then reboot the system:
```
hdmi_force_hotplug=1
hdmi_force_edid_audio=1
```
- if it is still not working correctly try to comment out `dtparam=audio=on` in the `/boot/config.txt` file and reboot

For more details check the [page of the library](https://pypi.org/project/rpi-ws281x/) used.

When the dimmable type is used it is necessary to follow also the [procedure to enable the hardware buttons](#buttons)

## Wiring

Connect the digital channel of the led strip to pin 18 or 12 ([BCM setup](https://www.google.com/search?q=raspberry+pi+bcm+pinout&oq=raspberry+pi+&aqs=chrome.1.69i57j69i59l3j35i39j69i65l3.103597j1j7&sourceid=chrome&ie=UTF-8)).

It is necessary to connect the leds ground wire to the pi ground wire to have a reliable connection. Be careful when you are using different power supplies for pi and LEDs: ground level might be different.

Usually, LED strips requires 5V to be controlled. The strip might work also with the direct connection to the 3.3V output of the raspberry pi but an adequate high frequency voltage shifter circuit can avoid troubles.

Dimmable LEDs can be connected to the same pins (only one color dimming is available at the moment)

## Light sensors

At the moment one light sensor type is supported (TSL2519).
Connect the sensor to the following pins (have a look [online](https://www.google.com/search?q=raspberry+pi+bcm+pinout&oq=raspberry+pi+&aqs=chrome.1.69i57j69i59l3j35i39j69i65l3.103597j1j7&sourceid=chrome&ie=UTF-8) where to find those pins):
 - 3.3V
 - GND
 - SDA
 - SCL

This sensor communicates with tje I2C connection with the Raspberry. In order to use this communication protocol it is necessary to enable the hardware I2C interface through the OS settings. This can be done with the following steps:
 - run the following command: `sudo raspi-config`
 - use the arrows to move down to the section `3 Interface Options` and press enter
 - use the arrows to move down to the section `P5 I2C` and press enter
 - select the `<Yes>` option using the right-left arrows and press enter
 - press `Esc` until you exit the menu
 - restart the software

Now the sensor should be working.