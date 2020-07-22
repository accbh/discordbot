# Bahrain vACC Discord Bot
## Running
Running the Discord bot requires the creation of a config file. The config file contains settings (for example channels to listen to, messages to listen to and the bot's token).<br>Here is an example:
```json
{

    "token": "",
    "listeningMessage": ""

}
```
Running the bot requires the *.ts files to be converted into *.js files. This is done by running the command: ```npx -ts-node index.ts```.