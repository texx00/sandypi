#!/usr/bin/env bash
export FLASK_APP=UIserver
export FLASK_ENV=development
echo "Starting the flask builtin server"
flask run --host=0.0.0.0
