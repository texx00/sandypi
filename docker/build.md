# Docker image build instructions

This instructions are specific to the Docker image creation. There are alredy images available to use that do not require to follow this procedure. See [Installation with Docker](readme.md)

## Simple image build

It is fairly easy to build the image for Linux (amd64) (or Windows with wsl) but it will not be compatible with a Raspberri Pi since the architecture there is arm/v7. This means that an image built with the standard docker command will work only on Linux.

It is possible to do the same on a running Raspberry Pi but it will require quite a long time to complete the image build.

The command required is (must be run from the main sandypi folder, not from the docker folder)

```bash
$> docker build -f docker/Dockerfile -t sandypi .
```

Then it is possible to run the container with:

```bash
$> docker run -d -p 5000:5000 sandypi
```

After running this command the software will be available on `localhost:5000`.

**Important**: the container will be stopped when the device is switched off. Furthermore, if the container is updated, the content will be deleted. To keep persistent data you need to use volumes. To make your like easier a docker-compose file is available in the [Install with Docker](readme.md) section. In this case, you will need to modify the file to change the `docker-compose.yml` file to use the freshly created image.

## Building an image for Raspberry Pi on Linux (Windows with wsl)

It is possible to build a Raspberri Pi (arm v7) image on Linux (or Windows with wsl) by using the buildx tool of Docker.

Start by creating a builder:

```bash
$> docker buildx create --name sandypibuilder
$> docker buildx use sandypibuilder
```

After the builder is created it is necessary to initiate it. The following command will force Docker to download the right tools:

```bash
$> docker buildx inspect --bootstrap
```

Now it is possible to start the build process with (must be run from the main Sandypi folder):

```bash
$> python dev_tools/update_frontend_version_hash.py
$> docker buildx build --platform linux/amd64,linux/arm/v7 -f docker/Dockerfile -t remote_repo_user/sandypi --push .
```

Now it is possible to push the image to your own docker registry and download it directly on the Raspberry Pi.
