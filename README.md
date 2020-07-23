# Bahrain vACC Discord Bot
## Running
Running the Discord bot requires the creation of a config file. The config file contains settings (for example channels to listen to, messages to listen to and the bot's token).<br><br>Here is an example:
```json
{

    "token": "bot_token",
    "listeningMessage": "message_to_listen_to",
    "prefix": "prefix",
    "roleName": "role_name",
    "welcomeMsg": "Welcome_message",
    "developers": [ "discord_id_1", "discord_id_2" ]
    
}
```
Running the bot is done by running the command: <br>```npx ts-node index.ts```<br>
