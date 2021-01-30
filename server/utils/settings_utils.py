import shutil
import os
import json
import logging
import platform
from netifaces import interfaces, ifaddresses, AF_INET
from deepmerge import always_merger

# Logging levels (see the documentation of the logging module for more details)
LINE_SENT = 6
LINE_RECEIVED = 5

# settings paths
settings_path = "./server/saves/saved_settings.json"
defaults_path = "./server/saves/default_settings.json"

def save_settings(settings):
    dataj = json.dumps(settings)
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
        def_settings = ""
        print(old_settings)
        with open(defaults_path) as f:
            def_settings = json.load(f)
        print(def_settings)
        new_settings = match_dict(old_settings, def_settings)
        print(new_settings)
        save_settings(new_settings)
    
def match_dict(mod_dict, ref_dict):
    return always_merger.merge(ref_dict, mod_dict)

# print the level of the logger selected
def print_level(level, logger_name):
    description = ""
    if level < LINE_RECEIVED:
        description = "NOT SET"
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
    update_settings_file_version()
    print(get_ip4_addresses())
    a = {"a":0, "b":{"c":2, "d":4}}
    b = {"a":1, "b":{"c":1, "e":5}, "c":3}
    c = match_dict(b,a)
    print(a)
    print(b)
    print(c)