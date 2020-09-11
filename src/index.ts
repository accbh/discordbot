/**

    Name: index.ts
    Version: 1.0.1
    Author: Liam P, Gavin v. G, Harrison D.
    Date: 04/09/2020
    Description: Main bot code. Will handle commands, reactions and users joining the server.

**/


import { readFileSync } from 'fs';
import { join } from 'path';

import { Logger, LogLevelValue, ConsoleLogger } from './lib/logger';
import { getHooks } from './lib/hooks';
import { VatsimApi } from './lib/vatsim';

const configContent = readFileSync(join(__dirname, '../config.json')).toString();
let url = 'https://www.google.com/calendar/render?action=TEMPLATE&text=Bahrain+vACC+Training&details=Training+Session+-+Generated+by+Jarvis&dates=';
// TODO - change how config is extracted
let { token, listeningMessage, prefix, roleName, welcomeMsg, developers, logChannel, trainingMessageChannel } = JSON.parse(configContent);

const logger: Logger = new ConsoleLogger(LogLevelValue.INFO);
const vatsimBaseUrl = 'https://api.vatsim.net';
const vatsimApi = new VatsimApi(vatsimBaseUrl, logger);

const hooks = getHooks(vatsimApi, logger);
const discordClient = new DiscordClient(token, ['MESSAGE', 'USER', 'REACTION'], hooks, logger);





discordClient.start();