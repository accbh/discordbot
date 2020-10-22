# Bahrain vACC Discord Bot

![Node.js CI](https://github.com/accbh/discordbot/workflows/Node.js%20CI/badge.svg?branch=master)

## Development and Running Locally

### Getting a Discord Bot Token

To add a bot to any Bahrain vACC servers, you require an administrator account within any Bahrain vACC servers.

Navigate to [Discord's Development Portal](https://discord.com/developers/applications) and sign in to create an application, please abide by the following conventions:

* For development bots, add your first name followed by Bot. For example: `LiamBot` or `GavinBot`.
* All bots that will be used in production require the Bahrain vACC logo to be present in the avatar.

Once an application has been created, open it and navigate to "Bot". You will find your token on that page.

### Instrumenting Local Environment

The default variables for being able to run locally have been added to `./scripts/variables`. Please do not change these unless you know what you are doing. Not all of the required variables are in this file; for example, you will need a personal Discord bot token. Once you acquire your Discord bot token, run the following:

```sh
mkdir ./local
echo $'#!/bin/bash\n\nDISCORD_TOKEN={your token goes here}\n' > ./local/variables
chmod +x ./local/variables
```

This will create a local variables file specific to your requirements. This file has been added to the gitignore to ensure your personal config is not sent to git when committing, and wont interfere with everyone elses' dev experience. If you want to override a default variable, put the new value in `./local/variables`.

To prepare your local environment for development, run:

```sh
source ./scripts/local-variables
```

This will populate your terminal with the variables needed for further instrumenting of your workspace.

### Run the Bot

```sh
source ./scripts/local-variables
source ./scripts/start-dev.sh
```

### Docker

To build a docker image, run these commands:

```sh
npm i
npm run build
source ./scripts/local-variables
cd docker
source ./build.sh
source ./run.sh
```

#### Useful Commands

* Ensure the container is running using `docker ps`.
* Check bot logs using `docker logs bot-dev`.
