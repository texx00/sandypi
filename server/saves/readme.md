# Settings JSON file format

The frontend can render the settings automatically if the correct json format is used.
The settings can be of different types depending on the input type needed. Example of setting:
```
{
    "name": "string",
    "type": "input" | "select" | "text" | "check",
    "value": "string" | number | boolean,
    "available_values": [list]
    "label": "string",
    "depends_on": "string",
    "depends_values": [list],
    "tip": "string"

}
```

* name: property name in the dict/list of properties with full tree (ex: "serial.port")

* type:
  * "input": single line text
  * "select": dropdown menu. Requires "available_values" to be a list of possible values
  * "text": multiline text
  * "check": checkbox (styled as a switch)

* value: the setting value

* available_values (optional): necessary only if the "select" type is used. Must be a list( `["el1", "el2", ...]`)

* label: Label to be used in the frontend

* depends_on (optional): a property may be hidden if another property is not selected. This will check the given property and hide the current property if the value of the control is not in the list given in `depends_values`.

* depends_values (optional): specify for which values of the `depends_on` field it must show the current option

* tip (optional): explains quickly the option role
