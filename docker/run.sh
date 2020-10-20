#!/bin/bash

NAME=$(jq -r '.name' ../package.json)
VERSION=$(jq -r '.version' ../package.json)

docker run -dt \
    --name bot-dev \
    -e LOGLEVEL=verbose \
    -e DISCORD_TOKEN=$DISCORD_TOKEN \
    -e DEVELOPER-IDS=$DEV_IDS \
    -e NEW_MEMBER_WELCOME_MESSAGE="$WELCOME_MESSAGE" \
    -e NOTIFICATION_ROLE_MESSAGE_ID=$NOTIFICATION_ROLE_MESSAGE_ID \
    -e NOTIFICATION_ROLE_NAME=$NOTIFICATION_ROLE_NAME \
    -e REQUEST_TRAINING_MESSAGE_ID=$REQUEST_TRAINING_MESSAGE_ID \
    -e REQUEST_TRAINING_CHANNEL_ID=$REQUEST_TRAINING_CHANNEL_ID \
    $REPO_NAME/$NAME:$VERSION