# Bahrain vACC Discord Bot
## Running
Running the Discord bot requires the creation of a config file. The config file contains settings (for example channels to listen to, messages to listen to and the bot's token).<br><br>Here is an example:
```json
{

    "token": "bot_token",
    "listeningMessage": "message_to_listen_to",
    "trainingMessage": "training_message",
    "trainingMessageChannel": "training_message_channel",
    "logChannel": "log_channel",
    "prefix": "prefix",
    "roleName": "role_name",
    "welcomeMsg": "Welcome_message",
    "developers": [ "discord_id_1", "discord_id_2" ]
    
}
```
## Running
Run the bot using ```npm start``` or ```npm run start:dev```<br>
