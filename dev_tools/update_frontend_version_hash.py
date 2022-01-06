import subprocess
import json

def get_commit_shash():
    result = subprocess.check_output(['git', 'log', '--pretty=format:"%h"', "-n", "1"])
    return result.decode(encoding="UTF-8").replace('"', '')  
  
shash = get_commit_shash()

# This script save the current git hash in a .env file for react.
# The script load the last commit hash as version (used by the frontend to check if it is necessary to clear the local storage)
# Additional variables can be added directly in the list of lines below
# run it like: (env)$> python dev_tools/update_frontend_version_hash.py


frontend_file_path = "./frontend/.env"

lines = [
    "/* THIS FILE IS GENERATED WITH THE FOLLOWING UTIL: */\n",
    "/* dev_tools/update_frontend_version.py*/\n",
    "/* Have a look there if you need to put additional variables */\n\n",
    f"REACT_APP_VERSION = {shash}"]               # start the server


with open(frontend_file_path, "w") as f:
    f.writelines(lines)

# saving the shash in a file so that it can be loaded inside the image and will be shown in the frontend to keep track of the current version used

with open("git_shash.json", "w") as f:
    json.dump({"shash": shash}, f)