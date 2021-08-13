import subprocess
from packaging import version

# Checks if there is a newer version/tag in the remote repo
# return a dict with remote and local tags plus a "behind" boolean if the remote version is higher
# return false if cannot compare tags because of a missing network connection
def compare_local_remote_tags():
    result = {}

    # Requesting remote tags
    try:
        remote_tags = subprocess.check_output(['git', 'ls-remote', '--tags'], stderr=subprocess.STDOUT)
    except:
        return False
    remote_tags = remote_tags.decode(encoding="UTF-8").split("\n")

    # Cleaning output
    remote_versions = []
    for l in remote_tags:
        l = l.split("\t")
        if len(l) > 1:
            remote_versions.append(l[1].replace("refs/tags/", ""))
    
    # Sorting remote tags
    remote_versions = [version.parse(t) for t in remote_versions]
    remote_versions = sorted(remote_versions, reverse=True)
    result["remote_latest"] = remote_versions[0]
    
    # Requesting local tag
    local_tag = subprocess.check_output(['git', 'describe', '--tags', '--abbrev=0'])
    local_tag = version.parse(local_tag.decode(encoding="UTF-8"))
    result["local"] = local_tag

    # Comparing outputs
    result["behind_remote"] = result["remote_latest"] > result["local"]

    return result

def get_commit_shash():
    result = subprocess.check_output(['git', 'log', '--pretty=format:"%h"', "-n", "1"])
    return result.decode(encoding="UTF-8").replace('"', '')    

def get_branch_name():
    result = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', "HEAD"])
    return result.decode(encoding="UTF_8").replace("\n", "")

def get_update_available():
    #subprocess.check_output(['git', "remote", "update"])
    result = subprocess.check_output(['git', "show", "origin/" + get_branch_name()]).decode(encoding="UTF-8")
    remote_hash = result.split("\n")[0].split(" ")[1]
    result = subprocess.check_output(["git", "rev-parse", "HEAD"]).decode(encoding="UTF-8")
    local_hash = result.replace("\n", "")
    return not (remote_hash == local_hash)

def switch_to_branch(branch):
    subprocess.check_output(["git", "checkout", "."])       # clearing local files before moving to another branch
    subprocess.check_output(["git", "checkout", branch])    # moving to the other branch

class UpdatesManager():
    def __init__(self):
        self.branch = get_branch_name()
        self.short_hash = get_commit_shash()
        if self.branch == "master":
            self.update_available = compare_local_remote_tags()["behind_remote"]
        else:
            self.update_available = get_update_available()


if __name__ == "__main__":
    #print(compare_local_remote_tags(verbose=True))

    print("branch name: {}".format(get_branch_name()))

    print("update available: {}".format(get_update_available()))

    print("Short hash: {}".format(get_commit_shash()))