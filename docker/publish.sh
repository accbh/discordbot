#!/bin/bash

set -e

NAME=$(jq -r '.name' ../package.json)
VERSION=$(jq -r '.version' ../package.json)
REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
echo "Publishing $REPO_NAME/$NAME:$VERSION"

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REGISTRY

docker build -t $REPO_NAME/$NAME:$VERSION ..

# give it a versioned name
docker tag $REPO_NAME/$NAME:$VERSION $REGISTRY/$REPO_NAME/$NAME:$VERSION
docker push $REGISTRY/$REPO_NAME/$NAME:$VERSION

# give it the latest tag
docker tag $REGISTRY/$REPO_NAME/$NAME:$VERSION $REGISTRY/$REPO_NAME/$NAME:latest
docker push $REGISTRY/$REPO_NAME/$NAME:latest

# delete the images from our local machine (prevents dead images lying around)
docker rmi $REGISTRY/$REPO_NAME/$NAME:$VERSION
docker rmi $REGISTRY/$REPO_NAME/$NAME:latest

rm ./package*
