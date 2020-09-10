echo 'Installing python dependencies'
python3 -m pip install -r requirements.txt

echo '\n\nInstalling js dependencies'
sudo npm install -g yarn
sudo yarn --cwd ./UIserver/static/js

echo '\n\nUpgrading database'
export FLASK_APP=UIserver
flask db upgrade

echo '\n\nInstalling app'
sudo python3 setup.py install