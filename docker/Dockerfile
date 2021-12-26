# Docker file to run the server in a docker environment

# IMPORTANT! before building this image it is important to use "python dev_tools/update_frontend_version_hash.py"

# build with: docker build -f docker/Dockerfile -t tagname .

# building frontend
FROM node:16.13.0-alpine AS step1

COPY frontend/yarn.lock frontend/package.json ./
RUN yarn install

COPY frontend/public /public
COPY frontend/src /src
COPY frontend/.env ./
RUN yarn build

# ------------------------

# preparing the python part of the image
FROM python:3.9-slim

LABEL mantainer="Texx00"
WORKDIR /sandypi

# setting up virtual environment
RUN apt-get update && apt-get install python3-dev gcc libc-dev -y
ENV FLASK_ENV=production VIRTUAL_ENV=/env PATH="$VIRTUAL_ENV/bin:$PATH" IS_DOCKER=true DB_PATH="/database"
RUN python -m pip install virtualenv wheel gunicorn
RUN python -m venv ${VIRTUAL_ENV}


# installing python dependencies
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt

# copying docker start files
COPY docker/check_prestart.py docker/start_server.sh ./

# copying server data
COPY migrations migrations
COPY server server
# TODO should check if these files are available inside a volume at runtime and substitute them with the custom ones
COPY .env.template .env
COPY .flaskenv setup.py ./

# copying frontend files into python image
COPY --from=step1 build frontend/build

RUN python setup.py install
# TODO add volumes
# TODO buildx port for raspberry

EXPOSE 5000
ENTRYPOINT ["bash", "start_server.sh"]