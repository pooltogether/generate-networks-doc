#!/bin/bash

echo "Generating markdown..."
./index.js
echo "Cloning repo..."
git clone git@github.com:pooltogether/documentation.git gitbook
cd gitbook
git checkout v3.3.0
cp ../networks/ethereum.md networks/ethereum.md
cp ../networks/xdai.md networks/xdai.md
cp ../networks/matic.md networks/matic.md
git add networks
git commit -m "Updated networks directory"
echo "Pushing changes..."
git push
cd ..
rm -rf gitbook