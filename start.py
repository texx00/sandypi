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
            "{}\n".format(folder[0:2]),                 # change drive
            "cd {}\n".format(folder),                   # go to the correct folder
            "call .\\env\\Scripts\\activate.bat\n",     # activate the environment
            "echo Server starting\n",                     # echo that the server is starting
            "flask run --host=0.0.0.0\n"]               # start the server

    else:
        print("You are running linux")
        print("Preparing start.sh")
        file_path = folder + "/start.sh"
        lines = [
            "#!/usr/bin/env bash\n",                      
            "cd {}\n".format(folder),                   # go to the correct folder
            "source env/bin/activate\n",                # activate the environment
            "chmod 777 .\n",                            # changing permission to the files otherwise cannot use the db
            "if test -f \"run_update.txt\"; then\n",
            "   echo \"Running update\"\n",
            "   sudo python3 start.py\n",
            "fi\n",
            "flask run --host=0.0.0.0\n"]               # start the server
    
    with open(file_path, "w") as f:
        f.writelines(lines)


def turn_autostart_on(folder, debug=False):
    if platform.system() == "Windows":
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
    else:
        print("Adding a sh file to the start folder")
        
        file_path = "{}/start.sh".format(folder)
        file_runner = "/etc/rc.local"
        print("Adding '{0}' to the autostart script:\n{1}".format(file_path, file_runner))
        lines = [ "{} &\n".format(file_path) ]     # call start.sh. IMPORTANT: must use '&' to let the script close correctly otherwise the pi will get stuck
            
        with open(file_runner, "r+") as f:
            d = f.readlines()
            f.seek(0)
            already_present = False
            for i in d:
                if file_path in i:
                    already_present = True
                elif "exit 0" in i and len(i) <10:  
                    if not already_present:
                        f.writelines(lines)
                    f.write(i)
                else:
                    f.write(i)
        
        os.system("chmod +x {}".format(file_runner))
    print("The server will start automatically from the next boot")
    

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
                if not file_path in i:
                    f.write(i)
            f.truncate()
    else:
        print("Adding a sh file to the start folder")
        
        file_path = "{}/start.sh".format(folder)
        file_runner = "/etc/rc.local"
        print("Removing '{0}' to the autostart script:\n{1}".format(file_path, file_runner))
        lines = [ "{} &\n".format(file_path) ]     # call start.sh. IMPORTANT: must use '&' to let the script close correctly otherwise the pi will get stuck
            
        with open(file_runner, "r+") as f:
            d = f.readlines()
            f.seek(0)
            for i in d:
                if not file_path in i:  
                    f.write(i)
            f.truncate()
        
        os.system("chmod +x {}".format(file_runner))
    print("From now, the server will not start automatically on boot")


def start_server(folder):
    print("Starting the server")
    if platform.system() == "Windows":
        os.system("{}\\start.bat".format(folder))
    else:
        os.system("chmod +x {}/start.sh".format(folder))
        os.system("{}/start.sh".format(folder))


def print_help():
    print("""\n\nUse: 'python start.py' to start the server. Available options are:
    -h: show the help
    -a: 
        valid values: on or off
        if 'debug' is used instead of 'on', the cmd windows that starts the server will not be hidden
        turns on or off the autostart of the server when the device is turned on""")



if __name__ == "__main__":
    folder = os.path.dirname(os.path.realpath(__file__))

    # check if must update the software before starting
    if platform.system() == "Windows":
        if os.path.isfile("{}\\run_update.txt".format(folder)):
            os.remove("{}\\run_update.txt".format(folder))
            os.system("git pull")
            os.system("{}\\install.bat".format(folder))
    else:
        if os.path.isfile("{}/run_update.txt".format(folder)):
            os.remove("{}/run_update.txt".format(folder))
            os.system("git pull")
            os.system("bash {}/install.sh".format(folder))

    # start the server
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
    start_server(folder)
