# This script convert the json settings (server/saves/default_settings.json) file into a dict that can be imported in javascript (to be used as defaults for the frontend settings)

import json

def write_dict(output_stream, val, tabs = 1):
    output_stream.write("{\n")
    first = True
    for key in val:
        if not first:
            output_stream.write(",\n")
        else: first = False

        output_stream.write("\t"*tabs + str(key) + ": ")
        write_content(output_stream, val[key], tabs)
    output_stream.write("\n" + "\t"*(tabs-1) + str("}"))

def write_array(output_stream, val, tabs = 1):
    output_stream.write("[\n")
    first = True
    for i in val:
        if not first:
            output_stream.write(",\n")
        else: first = False

        output_stream.write("\t"*tabs)
        write_content(output_stream, i, tabs)
    output_stream.write("\n" + "\t"*(tabs-1) + str("]"))

def write_content(output_stream, val, tabs = 1):
    if type(val) is dict:
        write_dict(output_stream, val, tabs = tabs+1)
    else: 
        if isinstance(val, str):
            output_stream.write('"{}"'.format(str(val)))
        elif isinstance(val, bool):
            output_stream.write(str(val).lower())
        elif isinstance(val, list):
            write_array(output_stream, val, tabs = tabs+1)
        else: output_stream.write(str(val))

with open("./server/saves/default_settings.json", "r") as defaults:
    values = json.load(defaults)
    with open("./frontend/src/structure/tabs/settings/defaultSettings.js", "w") as output:
        output.write("// This file is auto generated from the default settings file. \n// To generate a new version from the existing default values use the script: ./dev_tools/build_default_settings.py\n\n")

        output.write("const defaultSettings = ")
        
        write_dict(output, values)

        output.write("\n\nexport default defaultSettings;")