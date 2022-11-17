from zipfile import ZipFile
from datetime import datetime

from os import path, walk, listdir, remove

ZIP_PREFIX = "diagnostic_"
DIAGNOSTIC_FILE_PATH = path.join("server", "static")


def generate_diagnostic_zip():
    """
    Create a zip file containing log files and saved settings
    """
    # remove older zip file if present
    for f in listdir(DIAGNOSTIC_FILE_PATH):
        if f.startswith(ZIP_PREFIX) and f.endswith(".zip"):
            remove(path.join(DIAGNOSTIC_FILE_PATH, f))

    # create the new zip file
    current_date = datetime.today()
    str_datetime = current_date.strftime("%Y%m%d_%H%M%S")
    zip_path = path.join(DIAGNOSTIC_FILE_PATH, f"{ZIP_PREFIX}{str_datetime}.zip")

    with ZipFile(zip_path, "w") as zip_file:
        # fille the zip file with the diagnostic files
        for p in get_diagnostic_paths():
            # if the path is directory, add all the files within that folder
            if path.isdir(p):
                filenames = next(walk(p))[2]
                for f in filenames:
                    file = path.join(p, f)
                    if validate_diagnostic_file(file):
                        zip_file.write(file)
            # otherwise add the single file
            else:
                if validate_diagnostic_file(p):
                    zip_file.write(p)
    return zip_path


def validate_diagnostic_file(filename):
    """
    Filter out the files that are not necessary for the diagnostics

    Returns: True if the given file can be put inside the diagnostics zip
    """
    # ignore filenames starting with a "." (hidden files) and the older zip
    name = path.split(filename)[-1]
    return not name.startswith(".") and not name.startswith("diagnostic_")


def get_diagnostic_paths():
    """
    Returns: all the paths of data that should be saved inside the diagnostics zip
    """
    return [path.join("server", "saves", "saved_settings.json"), path.join("server", "logs")]


if __name__ == "__main__":
    print(get_diagnostic_paths())
    generate_diagnostic_zip()
