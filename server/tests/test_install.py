import os
import filecmp
import shutil

def test_requirements():
    unwanted_lines = ["#egg"]
    wanted_line = "setuptools"
    wanted_line_present = False
    error_message = "The requirements.txt file is incorrect. Please have a look at dev_tools/update_requirements.txt"
    with open("requirements.txt") as f:
        for line in f.readlines():
            for unwanted_line in unwanted_lines:
                if unwanted_line in line:
                    assert False, error_message
                if wanted_line in line:
                    wanted_line_present = True
    assert wanted_line_present, error_message       # should be True if the wanted line is present
    
def test_js_defaults():
    file1 = "./frontend/src/structure/tabs/settings/defaultSettings.js"
    file2 = "./tmp_default_settings.js"
    shutil.copy2(file1, file2)
    import dev_tools.build_default_settings         # creating js default settings
    res = filecmp.cmp(file1, file2)
    os.remove(file2)
    assert res, "When the default settings are changed is necessary to update the frontend settings as well. Please, have a look at dev_tools/build_default_settings.py"