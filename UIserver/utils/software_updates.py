import subprocess
from packaging import version

# Checks if there is a newer version/tag in the remote repo
# return a dict with remote and local tags plus a "behind" boolean if the remote version is higher
# return false if cannot compare tags because of a missing network connection
def compare_local_remote_tags(verbose=False):
    result = {}
    if not verbose:
        def print(val):
            pass

    # Requesting remote tags
    try:
        remote_tags = subprocess.check_output(['git', 'ls-remote', '--tags'])
    except:
        print("No connection available. Cannot check latest version.")
        return False
    remote_tags = remote_tags.decode(encoding="UTF-8").split("\n")
    print("Remote tags: \n{}\n\n".format(remote_tags))

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
    print("Remote latest version: {}".format(result["remote_latest"]))
    
    # Requesting local tag
    local_tag = subprocess.check_output(['git', 'describe', '--tags', '--abbrev=0'])
    local_tag = version.parse(local_tag.decode(encoding="UTF-8"))
    print("Local tag: {}".format(local_tag))
    result["local"] = local_tag

    # Comparing outputs
    result["behind_remote"] = result["remote_latest"] > result["local"]

    return result

def get_commit_shash():
    result = subprocess.check_output(['git', 'log', '--pretty=format:"%h"', "-n", "1"])
    return result.decode(encoding="UTF-8").replace('"', '')    

if __name__ == "__main__":
    print(compare_local_remote_tags(verbose=True))

    print("\n---------------\nShort hash: {}".format(get_commit_shash()))