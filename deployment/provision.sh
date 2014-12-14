#! /bin/bash
# Install Git
sudo apt-get install git -y
# Install NodeJS
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
cd -
# Install upstart script
sudo mkdir -p /var/log/intdai-mock-api
sudo cp intdai-mock-api.conf /etc/init
# Start app
sudo service intdai-mock-api restart
# Install app dependencies
cd ../
npm install