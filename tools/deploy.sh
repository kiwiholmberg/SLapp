#!/bin/bash

# Deployscript for slapp.
# Make shure export 'PEBBLE_PHONE=192.168.1.69' is set in your terminalconfig (bashrc)
# Run this from the root directory.

pebble build
pebble install

echo 'Sending web files to server'
scp -r web/* kiwi@kiwifoto.se:/web/kiwifoto.se/public/pebble

exits