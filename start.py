import platform
import os

if __name__ == "__main__":
    if platform.system() == "Windows":
        print("You are running windows")
        os.system("start.bat")
    else:
        print("You are running linux or mac")
        os.system("chmod +x start.sh")
        os.system("./start.sh")


