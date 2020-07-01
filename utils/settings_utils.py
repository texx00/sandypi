import shutil
import os
import json

settings_path = "./UIserver/saves/saved_settings.json"

def save_settings(settings):
    dataj = json.dumps(settings)
    with open(settings_path,"w") as f:
        f.write(dataj)

def load_settings():
    if(not os.path.exists(settings_path)):
        shutil.copyfile("UIserver/saves/default_settings.json", settings_path)
    settings = ""
    with open(settings_path) as f:
        settings = json.load(f) 
    return settings
    