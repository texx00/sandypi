#!/bin/bash
# check if .env files needs to be replaced
python check_prestart.py 

# Need to update the flask db at runtime
flask db upgrade 

# TODO setup a production server
# starts the server
flask run --host=0.0.0.0 