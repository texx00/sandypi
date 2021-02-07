echo '----- Installing python dependencies -----'
python -m pip install -r requirements.txt

echo '----- Updating sw version ----'
:: Necessary to avoid compatibility issues between old and new settings in the browser local storage
:: The frontend will compare the two verisions and in case of a mismatch will load the new settings from the server instead of loading the old redux state
python dev_tools/update_frontend_version_hash.py

echo '----- Installing js dependencies and building frontend app -----'
call npm install -g yarn
call yarn --cwd ./frontend install
call yarn --cwd ./frontend build

echo '----- Upgrading database -----'
flask db upgrade

echo '----- Installing app -----'
:: With "install.bat develop" will install the package for development. This is necessary to use the editable version of the package and avoid problems with "pip freeze" saving the local package in the requirements.txt
IF (%1==develop) ( python setup.py develop -e -b build ) ELSE ( python setup.py install )