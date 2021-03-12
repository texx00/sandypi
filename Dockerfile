## To build:
# docker build --tag sandypi
## To run (add --rm if you don't want to have a bunch of copies):
# docker run --publish 5000:5000 sandypi

FROM nikolaik/python-nodejs:latest

RUN set -x \
    && apt-get update \
    && apt install -y libopenjp2-7 libtiff5 \
    && rm -rf /var/lib/apt/lists/

WORKDIR /sandypi

ADD . /sandypi

# Remove the sudo commands
RUN set -x \
    && sed -i "s/sudo //g" ./install.sh \
    && chmod a+x ./install.sh

RUN set -x \
    && ./install.sh

CMD ["python","./start.py"]
