:: This bat file updates the requirements.txt file
:: Must use "install.bat develop" for the installation to avoid packages problems with pip
:: Can run this also from cmd line (cd dev_tools && update_requirements.bat && cd ..)
:: --all to add in setuptools
:: --exclude-editable to exlude the current repo
:: Linux:
::    pip3 freeze --all --exclude-editable > requirements.txt
python -m pip freeze --all --exclude-editable > ../requirements.txt