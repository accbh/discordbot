# Bahrain vACC Discord Bot

## Development and Running Locally

Running the Discord bot requires the creation of a scripts folder with a `start-dev.sh` or `start-dev.bat` in it. This script will then be used to start the app locally using your own custom arguments.

Here is an example:

```sh
#!/bin/bash

WELCOME_MESSAGE=$'**Welcome to the Bahrain vACC Discord!**\n\n> Naming Convention\nPlease set your Discord nickname to your name \(or variant of your name\) followed by your VATSIM ID. For example: Liam P - 1443704. If you don\'t do this, you will most likely be removed.\nRole will be assigned to you soon by a staff member.\n\nBy joining the server, you agree to the rules listed in \#info as well as the VATSIM COC.'

(npm run start:dev -- \
  --loglevel=verbose \
  --discord-token={{your own discord bot token}} \
  --developer-ids=167764605957832704,574333819017101312,710430766173126727 \
  --new-member-welcome-message="$WELCOME_MESSAGE" \
  --notification-role-message-id=754827107904782406 \
  --notification-role-name=Notifications \
  --request-training-message-id=754856714242621471 \
  --request-training-channel-id=754827086577008800
)
```

All that's left to do is execute:

```sh
# for unix
./scripts/start-dev.sh

# for windows
./scripts/start-dev.bat
```

## Docker

To build a docker image, run these commands:

* `npm i`
* `npm run build`
* `cd docker`
* `./build.sh`

Then create `run.sh` in the Docker folder (this files has been git-ignored), add the following:

```sh
#!/bin/bash

WELCOME_MESSAGE=$'**Welcome to the Bahrain vACC Discord!**\n\n> Naming Convention\nPlease set your Discord nickname to your name \(or variant of your name\) followed by your VATSIM ID. For example: Liam P - 1443704. If you don\'t do this, you will most likely be removed.\nRole will be assigned to you soon by a staff member.\n\nBy joining the server, you agree to the rules listed in \#info as well as the VATSIM COC.'

docker run -dt \
    --name bot-dev \
    -e LOGLEVEL=verbose \
    -e DISCORD_TOKEN={your_token_here} \
    -e DEVELOPER-IDS=167764605957832704,574333819017101312,710430766173126727 \
    -e NEW_MEMBER_WELCOME_MESSAGE="$WELCOME_MESSAGE" \
    -e NOTIFICATION_ROLE_MESSAGE_ID=754827107904782406 \
    -e NOTIFICATION_ROLE_NAME=Notifications \
    -e REQUEST_TRAINING_MESSAGE_ID=754856714242621471 \
    -e REQUEST_TRAINING_CHANNEL_ID=754827086577008800 \
    accbh/accbhbotjs:latest

```

Now run these commands:

* `chmod +x ./run.sh`
* `./run.sh`

### Useful Commands

* Ensure the container is running using `docker ps`.
* Check bot logs using `docker logs bot-dev`.
