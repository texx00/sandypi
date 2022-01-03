# Environment variable always used with flask
# For additional custom variables check the ".env.template" file
FLASK_APP=server

# Feeder logger level: 
#  * 4 -> log low level commands (used to manage the board status)
#  * 5 -> acks received from the device (and above) about the drawing process 
#  * 6 -> lines sent to the device (and above)
#  *  other standard logging levels of python
FEEDER_LEVEL=30   

# Flask logger level: uses standard python loggin levels (10-debug, 20-info, 30-warning, 40-error, 50-critical). Can set to warning to hide standard http requests
FLASK_LEVEL=30

# Can change this to 1 to make flask autoreload on files change (can set it from the launch.json file in vscode, for production must be 0 until a production server is setup)
FLASK_DEBUG=0
