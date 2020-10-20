#!/bin/bash
set -e

NAME=$(jq -r '.name' ../package.json)
VERSION=$(jq -r '.version' ../package.json)
echo "Building $REPO_NAME/$NAME:$VERSION"

jq '.version="0.0.0"' ../package.json > package.json
jq '.version="0.0.0"' ../package-lock.json > package-lock.json

docker build -t $REPO_NAME/$NAME:$VERSION ..
docker tag $REPO_NAME/$NAME:$VERSION $REPO_NAME/$NAME:latest

rm ./package*
