import os
from shutil import copyfile


print("Prestart checks")

# Checking if the .env file is in the "saves" volume in order to copy it in the main folder
ENV_FILE_PATH = "./server/saves/.env"
if os.path.exists(ENV_FILE_PATH):
    print("Found .env file. Copying it to the main folder")
    copyfile(ENV_FILE_PATH, ".env")
    print("File .env copied.")

print("Prestart checks done")