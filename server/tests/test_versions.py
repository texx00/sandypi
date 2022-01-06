import yaml
# checks if the Dockerfile and the docker-compose.yml file are using the same version

def test_docker_versions():
    dc = None
    df = None
    tmp = None
    with open("docker/docker-compose.yml") as file:
        tmp = dict(yaml.load(file, Loader=yaml.FullLoader))
    envvars = tmp["services"]["sandypi"]["environment"]
    for v in envvars:
        if v.startswith("DOCKER_COMPOSE_FILE_VERSION="):
            dc = int(v.split("=")[1])

    with open("docker/Dockerfile") as file:
        for l in file.readlines():
            if l.startswith("ENV DOCKER_COMPOSE_FILE_EXPECTED_VERSION="):
                df = int(l.split("=")[1])
    assert(df == dc)

if __name__ == "__main__":
    test_docker_versions()