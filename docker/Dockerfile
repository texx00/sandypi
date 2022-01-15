# Docker file to run the server in a docker environment

# IMPORTANT! before building this image it is important to use "python dev_tools/update_frontend_version_hash.py". Check the build.md file

# building frontend
FROM node:16.13.0-alpine AS step1

COPY frontend/yarn.lock frontend/package.json ./
RUN yarn install --network-timeout=100000

COPY frontend/public /public
COPY frontend/src /src
COPY frontend/.env ./
RUN yarn build

# ------------------------

# preparing the python part of the image
FROM python:3.9.9

LABEL mantainer="Texx00"
WORKDIR /sandypi

# setting up virtual environment
# for some reason I'm not able to build this with the slim version of the image because the apt-get install is failing (connection issues to the packages sites)
# as a workaround will use the non-slim version of the image -> will get a larger image on the registry
#RUN apt-get update && apt-get install python3-dev gcc libc-dev -y
ENV FLASK_ENV=production VIRTUAL_ENV=/env PATH="$VIRTUAL_ENV/bin:$PATH" IS_DOCKER=true CFLAGS=-fcommon
RUN python -m pip install virtualenv wheel
RUN python -m venv ${VIRTUAL_ENV}

# installing GPIO libraries only on arm/v7
ARG TARGETVARIANT TARGETARCH
RUN if [ "$TARGETARCH/$TARGETVARIANT" = "arm/v7" ] ; then python -m pip install RPi.GPIO adafruit-circuitpython-neopixel adafruit-circuitpython-tsl2591 rpi_ws281x ; fi

# adding docker-compose file version here to compare at runtime if need to update the file manually on the host
# this version should always match the DOCKER_COMPOSE_FILE_VERSION in the docker-compose.yml file
ENV DOCKER_COMPOSE_FILE_EXPECTED_VERSION=1

# installing python dependencies
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt

# git_shash.json must be updated with "python dev_tools/update_frontend_version_hash.py" before creating the image
COPY .flaskenv setup.py ./

# copying docker start files
COPY docker/check_prestart.py docker/start_server.sh docker/wsgi.py docker/check_pre_update.sh ./

# copying server data
COPY migrations migrations
COPY server server
# copy placeholder copy hidden by the .dockerignore
COPY docker/placeholder.jpg server/static/Drawings/placeholder.jpg

# copying frontend files into python image
COPY --from=step1 build frontend/build

COPY git_shash.json git_shash.json

RUN python setup.py install

EXPOSE 5000
ENTRYPOINT ["bash", "start_server.sh"]