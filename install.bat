echo '----- Installing python dependencies -----'
python -m pip install -r requirements.txt

echo '----- Installing js dependencies -----'
call npm install -g yarn
call yarn --cwd ./server/static/js

echo '----- Upgrading database -----'
flask db upgrade

echo '----- Installing app -----'
python setup.py install