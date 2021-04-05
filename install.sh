touch server/logs/install.log

{
now=$(date)
echo ""
echo "--------------------------------------------------------------------"
echo "Starting installation time: $now"
echo "--------------------------------------------------------------------"
echo ""

echo '----- Installing python dependencies -----'
python3 -m pip install -r requirements.txt

echo '----- Updating sw version ----'
python3 dev_tools/update_frontend_version_hash.py

echo '\n\n----- Installing js dependencies and building frontend app -----'
sudo npm install -g yarn
sudo yarn --cwd ./frontend install
sudo yarn --cwd ./frontend build

echo '\n\n----- Upgrading database -----'
flask db upgrade

echo '\n\n----- Installing app -----'
sudo python3 setup.py install


now=$(date)
echo ""
echo "-------------------------------------------------------------------"
echo "Installation end: $now"
echo "-------------------------------------------------------------------"
echo ""

} 2>&1 | tee -a server/logs/install.log
