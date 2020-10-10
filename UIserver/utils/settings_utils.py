import shutil
import os
import json

settings_path = "./UIserver/saves/saved_settings.json"
defaults_path = "UIserver/saves/default_settings.json"

def save_settings(settings):
    dataj = json.dumps(settings)
    with open(settings_path,"w") as f:
        f.write(dataj)

def load_settings():
    settings = ""
    with open(settings_path) as f:
        settings = json.load(f) 
    return settings
    
def update_settings_file_version():
    print("Updating settings save files")
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

if __name__ == "__main__":
    # testing update_settings_file_version
    settings_path = "../"+settings_path
    defaults_path = "../"+defaults_path
    update_settings_file_version()