#! /bin/bash

# Install NodeJS
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs

# Install upstart script
sudo mkdir -p /var/log/intdai-mock-api
sudo cp /opt/intdai-mock-api/deployment/intdai-mock-api.conf /etc/init

# Install app dependencies
npm install

# Start app
sudo service intdai-mock-api restart

# Install nginx
sudo apt-get update
sudo apt-get install nginx -y

# Override default nginx configuration
sudo cp /opt/intdai-mock-api/deployment/intdai-mock-api.nginx.conf /etc/nginx/sites-available/default

# Restart nginx to populate latest configuration changed
sudo service nginx restart