#!/bin/bash
set -e

NAME=$(jq -r '.name' ../package.json)
VERSION=$(jq -r '.version' ../package.json)
echo "Building ${NAME}:${VERSION}"

jq '.version="0.0.0"' ../package.json > package.json
jq '.version="0.0.0"' ../package-lock.json > package-lock.json

docker build -t accbh/${NAME}:${VERSION} ..
docker tag accbh/${NAME}:${VERSION} accbh/${NAME}:latest