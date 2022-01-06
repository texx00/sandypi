import json
import os

from dotenv import load_dotenv

def get_commit_shash():
    res = {}
    with open("git_shash.json", "r") as f:
        res = json.load(f)
    return res["shash"]

# Checks if the docker compose file is at the latest version
def check_docker_compose_latest_version():
    load_dotenv()
    if not os.getenv("IS_DOCKER", default=None) is None:
        return os.getenv("DOCKER_COMPOSE_FILE_VERSION") == os.getenv("DOCKER_COMPOSE_FILE_EXPECTED_VERSION")
    return True

AUTOUPDATE_FILE_PATH = "./server/saves/autoupdate.txt"

class UpdatesManager():
    def __init__(self):
        self.short_hash = get_commit_shash()
        self.docker_compose_latest_version = check_docker_compose_latest_version()
    
    def autoupdate(self, enabled=True):
        if enabled and not self.is_autoupdate_enabled():
            with open(AUTOUPDATE_FILE_PATH, "w"):
                pass
        if not enabled and self.is_autoupdate_enabled():
            os.remove(AUTOUPDATE_FILE_PATH)
    
    def toggle_autoupdate(self):
        self.autoupdate(not self.is_autoupdate_enabled())
    
    def is_autoupdate_enabled(self):
        return os.path.exists(AUTOUPDATE_FILE_PATH)

if __name__ == "__main__":
    pass