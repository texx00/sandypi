#!/bin/bash

# check if .env files needs to be replaced
python check_prestart.py

# Need to update the flask db at runtime
flask db upgrade

# starts the server
gunicorn --bind 0.0.0.0:5000 server:app