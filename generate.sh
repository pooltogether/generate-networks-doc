#!/bin/bash

echo "Generating markdown..."
./index.js
echo "Cloning repo..."
git clone git@github.com:pooltogether/documentation.git gitbook
cd gitbook
git checkout v3.4.0
cp -rf ../networks/* resources/networks/
git add resources/networks
git commit -m "Updated networks directory"
echo "Pushing changes..."
git push
cd ..
rm -rf gitbook