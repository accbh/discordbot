#!/bin/bash

(npm run start:dev -- \
  --loglevel=$LOG_LEVEL \
  --discord-token=$DISCORD_TOKEN \
  --developer-ids=$DEV_IDS \
  --new-member-welcome-message="$WELCOME_MESSAGE" \
  --notification-role-message-id=$NOTIFICATION_ROLE_MESSAGE_ID \
  --notification-role-name=$NOTIFICATION_ROLE_NAME \
  --request-training-message-id=$REQUEST_TRAINING_MESSAGE_ID \
  --request-training-channel-id=$REQUEST_TRAINING_CHANNEL_ID
)
