import os
import platform
import sys
import getopt
import getpass

def generate_start_file(folder):
    if platform.system() == "Windows":
        print("You are running windows")
        print("Preparing start.bat")
        file_path = folder + "\\start.bat"
        lines = [
            "SETCONSOLE /hide   :: Comment this line to make the console visible sat startup\n", # hide the console at startup (comment the line if you want to see the console)
            "{}\n".format(folder[0:2]),                 # change drive
            "cd {}\n".format(folder),                   # go to the correct folder
            "call .\\env\\Scripts\\activate.bat\n",     # activate the environment
            "SET FLASK_APP=UIserver\n",                 # set environmental variables
            "SET FLASK_ENV=development\n", 
            "echo Server starting\n",                     # echo that the server is starting
            "flask run --host=0.0.0.0\n"]               # start the server

        with open(file_path, "w") as f:
            f.writelines(lines)
    else:
        pass
        # TODO autostart for raspberry

def turn_autostart_on(folder, debug=False):
    if platform.system() == "Windows":
        print("You are running windows")
        print("Adding a bat file to the start folder")
        
        USER_NAME = getpass.getuser()
        
        file_path = "{}\\start.bat".format(folder)
        file_runner = "{}\\run_hidden.vbs".format(folder)
        bat_path = "C:\\Users\\{}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup".format(USER_NAME)
        print("Adding '{0}' to the autostart folder:\n{1}".format(file_path, bat_path))
        with open(bat_path + '\\' + "open.bat", "w+") as bat_file:
            if debug:
                bat_file.write('start "" {}'.format(file_path))
            else:
                bat_file.write('start {0} {1}'.format(file_runner, file_path))
        print("The server will start automatically from the next boot")
    else:
        pass
        # TODO autostart for raspberry


def turn_autostart_off(folder):
    if platform.system() == "Windows":
        print("You are running windows")
        print("Removing line from the start bat")
        
        USER_NAME = getpass.getuser()
        
        file_path = "{}\\start.bat".format(folder)
        bat_path = "C:\\Users\\{}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup".format(USER_NAME)
        print("Removing '{0}' from the autostart folder:\n{1}".format(file_path, bat_path))
        with open(bat_path + '\\' + "open.bat", "r+") as f:
            d = f.readlines()
            f.seek(0)
            for i in d:
                if i != 'start "" {}'.format(file_path):
                    f.write(i)
            f.truncate()
        print("From now, the server will not start automatically on boot")
    else:
        pass
        # TODO autostart for raspberry


def start_server():
    if platform.system() == "Windows":
        print("Starting the server")
        os.system("{}\\start.bat".format(folder))
    else:
        # TODO fix start for raspberry
        print("You are running linux or mac")
        os.system("chmod +x start.sh")
        os.system("./start.sh")


def print_help():
    print("""\n\nUse: 'python start.py' to start the server. Available options are:
    -h: show the help
    -a: 
        valid values: on or off
        if 'debug' is used instead of 'on', the cmd windows that starts the server will not be hidden
        turns on or off the autostart of the server when the device is turned on""")



if __name__ == "__main__":
    folder = os.path.dirname(os.path.realpath(__file__))
    generate_start_file(folder)                 # generate the .bat or .sh file

    try:
        opts, args = getopt.getopt(sys.argv[1:], "ha:") # check args
    except getopt.GetoptError:
        print_help()
        sys.exit(2)
    for opt, arg in opts:
        if opt == "-h":                         # show the help
            print_help()
            sys.exit(0)
        elif opt == "-a":                       # turn on/off the server automatic start
            if arg == "=on":
                turn_autostart_on(folder)
                sys.exit(0)
            elif arg == "=off":
                turn_autostart_off(folder)
                sys.exit(0)
            elif arg == "=debug":
                turn_autostart_on(folder, debug=True)
                sys.exit(0)
            else:
                print("Argument for '{}' invalid: use 'on' or 'off'".format(opt))
                sys.exit(2)
        else:
            print("Command '{}' not recognized".format(opt))
            sys.exit(2)
    
    # if no argument was used, starts the server
    start_server()
