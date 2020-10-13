import shutil
import os
import json
import logging


# Logging levels (see the documentation of the logging module for more details)
LINE_SENT = 6
LINE_RECEIVED = 5

# settings paths
settings_path = "./UIserver/saves/saved_settings.json"
defaults_path = "UIserver/saves/default_settings.json"

def save_settings(settings):
    dataj = json.dumps(settings)
    with open(settings_path,"w") as f:
        f.write(dataj)

def load_settings():
    settings = ""
    if not os.path.isfile(settings_path):        # for python tests
        tmp_settings_path = defaults_path
    with open(tmp_settings_path) as f:
        settings = json.load(f) 
    return settings
    
def update_settings_file_version():
    logging.info("Updating settings save files")
    if(not os.path.exists(settings_path)):
        shutil.copyfile(defaults_path, settings_path)
    else:
        old_settings = load_settings()
        def_settings = ""
        with open(defaults_path) as f:
            def_settings = json.load(f)
        
        new_settings = match_dict(old_settings, def_settings)
        save_settings(new_settings)
    
def match_dict(mod_dict, ref_dict):
    new_dict = {}
    for k in ref_dict.keys():
        if k in mod_dict:
            if type(mod_dict[k]) is dict:
                new_dict[k] = match_dict(mod_dict[k], ref_dict[k])
            else:
                new_dict[k] = mod_dict[k]
        else:
            new_dict[k] = ref_dict[k]
    return new_dict

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


if __name__ == "__main__":
    # testing update_settings_file_version
    settings_path = "../"+settings_path
    defaults_path = "../"+defaults_path
    update_settings_file_version()