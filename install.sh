echo 'Installing python dependencies'
python3 -m pip install -r requirements.txt

echo '\n\nInstalling js dependencies'
npm install -g yarn
yarn --cwd ./UIserver/static/js

echo '\n\nUpgrading database'
export FLASK_APP=UIserver
flask db upgrade

echo '\n\nInstalling app'
python3 setup.py install