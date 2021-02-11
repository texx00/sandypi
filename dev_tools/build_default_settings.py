# This script convert the json settings (server/saves/default_settings.json) file into a dict that can be imported in javascript (to be used as defaults for the frontend settings)

import json

def write_dict(output_stream, val, tabs = 1):
    output_stream.write("{\n")
    first = True
    for key in val:
        if not first:
            output.write(",\n")
        else: first = False

        output_stream.write("\t"*tabs + str(key) + ": ")
        if type(val[key]) is dict:
            write_dict(output_stream, val[key], tabs = tabs+1)
        else: 
            if isinstance(val[key], str):
                output.write('"{}"'.format(str(val[key])))
            elif isinstance(val[key], bool):
                output.write(str(val[key]).lower())
            else: output.write(str(val[key]))
    output_stream.write("\n" + "\t"*(tabs-1) + str("}"))

with open("./server/saves/default_settings.json", "r") as defaults:
    values = json.load(defaults)
    with open("./frontend/src/structure/tabs/settings/default_settings.js", "w") as output:
        output.write("// This file is auto generated from the default settings file. \n// To generate a new version from the existing default values use the script: ./dev_tools/build_default_settings.py\n\n")

        output.write("const default_settings = ")
        
        write_dict(output, values)

        output.write("\n\nexport default default_settings;")