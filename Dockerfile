# Docker file to run the server in a docker environment

# IMPORTANT! before building this image it is important to use "python dev_tools/update_frontend_version_hash.py"

# building frontend
FROM node:16.13.0-alpine AS step1

COPY frontend/yarn.lock yarn.lock
COPY frontend/package.json package.json
RUN yarn install

COPY frontend/public public
COPY frontend/.env .env
COPY frontend/src src
RUN yarn build

# ------------------------

# preparing the python part of the image
FROM python:3.9-slim

LABEL mantainer="Texx00"

# setting up virtual environment
RUN apt-get update && apt-get install python3-dev gcc libc-dev -y
ENV FLASK_ENV production
ENV VIRTUAL_ENV=/env
RUN python -m pip install virtualenv 
RUN python -m venv ${VIRTUAL_ENV}
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# installing python dependencies
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt

# copying server data
COPY server server
COPY .env.template .env
COPY .flaskenv .flaskenv

# copying frontend files into python image
COPY --from=step1 build frontend/build

# updating database
RUN flask db upgrade; exit 0

EXPOSE 5000
ENTRYPOINT [ "flask", "run", "--host=0.0.0.0" ]