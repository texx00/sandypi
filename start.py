import platform
import os

if __name__ == "__main__":
    if platform.system() == "Windows":
        print("Running windows")
        os.system("start.bat")
    else:
        print("Running linux or mac")
        os.system("start.sh")


