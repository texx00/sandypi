:: This bat file updates the requirements.txt file
:: Can run this also from cmd line
:: --all to add in setuptools
:: --exclude-editable to exlude the current repo
:: Linux:
::    pip3 freeze --all --exclude-editable > requirements.txt
python -m pip freeze --all --exclude-editable > ../requirements.txt