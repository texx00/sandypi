import shutil
import os
import json
import logging
import platform
from netifaces import interfaces, ifaddresses, AF_INET

# Logging levels (see the documentation of the logging module for more details)
LINE_SENT = 6
LINE_RECEIVED = 5
LINE_SERVICE = 4

# settings paths
settings_path = "./server/saves/saved_settings.json"
defaults_path = "./server/saves/default_settings.json"

OVERWRITE_FIELDS = [
    "available_values",
    "depends_on",
    "depends_values",
    "tip",
    "label"
]

def save_settings(settings):
    dataj = json.dumps(settings, indent=4)
    with open(settings_path,"w") as f:
        f.write(dataj)

def load_settings():
    settings = ""
    tmp_settings_path = settings_path
    if not os.path.isfile(settings_path):        # for python tests
        tmp_settings_path = defaults_path
    with open(tmp_settings_path) as f:
        settings = json.load(f) 
    settings["system"] = {}
    settings["system"]["is_linux"] = platform.system() == "Linux"
    return settings
    
def update_settings_file_version():
    logging.info("Updating settings save files")
    if(not os.path.exists(settings_path)):
        shutil.copyfile(defaults_path, settings_path)
    else:
        old_settings = load_settings()

        # compatibility check for older versions of the settings
        # older format of the settings is not compatible with the newer one, thus it must delete the settings. TODO Should remove this line after a while (I will give 3 months thus until 05/2021)... The first versions will not be installed on many devices
        if not type(old_settings["serial"]["port"]) is dict: 
            shutil.copyfile(defaults_path, settings_path)
        
        
        def_settings = ""
        with open(defaults_path) as f:
            def_settings = json.load(f)
        new_settings = match_dict(old_settings, def_settings)
        save_settings(new_settings)
    
def match_dict(mod_dict, ref_dict):
    if type(ref_dict) is dict:
        if not type(mod_dict) is dict:
            return ref_dict           # if the old field was not a dict but a single value must return the new dict because cannot convert a single value into a dict
        
        new_dict = dict(mod_dict)   # clone object
        for k in ref_dict.keys():
            if (not k in new_dict) or (k in OVERWRITE_FIELDS):
                new_dict[k] = ref_dict[k]    # if key is not set, adds the key as an empty dict
            else:
                new_dict[k] = match_dict(new_dict[k], ref_dict[k])
        return new_dict
    else:
        return mod_dict

def get_only_values(ref_dict):
    res = {}
    if not type(ref_dict) is dict:
        return ref_dict
    for i in ref_dict:
        if type(ref_dict[i]) is dict:
            if "value" in ref_dict[i]:
                res[i] = ref_dict[i]["value"]
            else:
                res[i] = get_only_values(ref_dict[i])
    return res

# print the level of the logger selected
def print_level(level, logger_name):
    description = ""
    if level < LINE_SERVICE:
        description = "NOT SET"
    elif level < LINE_RECEIVED:
        description = "LINE_SERVICE"
    elif level < LINE_SENT:
        description = "LINE_RECEIVED"
    elif level < 10:
        description = "LINE_SENT"
    elif level < 20:
        description = "DEBUG"
    elif level < 30:
        description = "INFO"
    elif level < 40:
        description = "WARNING"
    elif level < 50:
        description = "ERROR"
    else:
        description = "CRITICAL"
    print("Logger '{}' level: {} ({})".format(logger_name, level, description))

def get_ip4_addresses():
    ip_list = []
    for interface in interfaces():
        try:
            for link in ifaddresses(interface)[AF_INET]:
                ip_list.append(link['addr'])
        except:
            # if the interface is whitout ipv4 adresses can just pass
            pass

    return ip_list


# To run it must be in "$(env) server>" and use "python utils/settings_utils.py"
if __name__ == "__main__":
    # testing update_settings_file_version
    settings_path = "../"+settings_path
    defaults_path = "../"+defaults_path

    a = {"a":0, "b":{"c":2, "d":4}, "d":5}
    b = {"a":1, "b":{"c":1, "e":5}, "c":3}
    c = match_dict(a,b)
    print(a)
    print(b)
    print(c)
    print(c=={"a":0, "b":{"c":2, "d":4, "e":5}, "d":5, "c":3})

    update_settings_file_version()
    print(get_ip4_addresses())

    d = {"a":500, "b":{"asf":3, "value":10}, "c":{"d":{"fds":29, "value":32}}}
    print(get_only_values(d))