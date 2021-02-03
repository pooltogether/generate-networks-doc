#!/bin/bash

echo "Generating markdown..."
./index.js
echo "Cloning repo..."
git clone git@github.com:pooltogether/documentation.git gitbook
cd gitbook
git checkout v3.2.0
cp ../Networks.md networks.md
git add networks.md
git commit -m "Updated networks.md"
echo "Pushing changes..."
git push
cd ..
rm -rf gitbook