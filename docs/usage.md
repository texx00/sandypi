# User guide

After [setting up the connection with the device](first_setup.md) you can start to load new drawings.


## Drawings

In the home page or in the drawings tab you can hit the upload drawing button to load one or more new drawings. The drawings must be using gcode commands and the file must be with a `.gcode` extension.

After loading a drawing, you can click (or right click) on it to start it.

## Playlists

If you want to put more drawings in sequence you can use a playlist. You can create playlists from the home page or from the dedicated "Playlists" tab.

After creating a playlist it is possible to add drawings directly by loading them into the playlist or by using the dedicated button in the single drawing preview.

In a playlist it is possible to add additional type of elements:
* gcode elements: to run specific gcode commands between drawings,
* more to come...

## Manual Control

In the manual control tab it is possible to run single gcode command with a `terminal-like` feature. On the right a preview of the position of the drawing is shown: the preview is not in realtime as the device is buffering the commands thus there may be a small delay between the drawing and the real position of the device.

## Settings

### Scripts

Scripts are executed once when the device is connected or before and after a "Drawing element" is played. You can put your own GCODE to make the table achieve specific tasks. It is also possible to use macros in those fields. Have a better look at the "Macros" in the "Advanced usage" section.

## Advanced usage

### Macros

The software can evaluate some extra gcode formulas. Those formulas are not standardized macros but can be used as follow: macros are delimited by the `&` character. It is possible to use standard python notation in the formulas with the addition of the basic math functions. For more information about this check the [parser's instruction page](https://pypi.org/project/py-expression-eval/).
It is possible to use `X`, `Y` and `F` as variables. They will be substituted with the last received value.

Some examples:
```
G0 X10 Y7
G0 X& x+5 &             --> G0 X15

G92 X& x%6 & Y& y%6 &   --> G92 X3 Y1
```

___

**If you need help or something is not working feel free to open an issue. If you want to improve this page feel free to open a pull request ;)**