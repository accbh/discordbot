/**

    Name: index.ts
    Version: 2.0.0
    Author: Liam P, Gavin v. G, Harrison D.
    Date: 11/09/2020
    Description: Bot index, will compose all the parts we need and start/stop the process.

**/


import { readFileSync } from 'fs';
import { join } from 'path';

import { Logger, LogLevelValue, ConsoleLogger } from './lib/logger';
import { VatsimApi } from './lib/vatsim';
import { MessageReactionAdd, MessageReactionRemove } from './lib/events';
import { DiscordClient } from './lib/discord-client';

/******** Config ********/
const configContent = readFileSync(join(__dirname, '../config.json')).toString();
let calendarUrl = 'https://www.google.com/calendar/render?action=TEMPLATE&text=Bahrain+vACC+Training&details=Training+Session+-+Generated+by+Jarvis&dates=';
// TODO - change how config is extracted
let { token, listeningMessage, prefix, roleName, welcomeMsg, developers, logChannel, requestTrainingMessageId, trainingRequestChannelId } = JSON.parse(configContent);

/******** Extras ********/
const logger: Logger = new ConsoleLogger(LogLevelValue.INFO);
const vatsimBaseUrl = 'https://api.vatsim.net';
const vatsimApi = new VatsimApi(vatsimBaseUrl, logger);

/******** Discord Client ********/

const discordClient = new DiscordClient(token, ['MESSAGE', 'USER', 'REACTION'], [], logger);

/******** Messsage Reaction Add ********/
//TODO - Rename the listening message variable, be more specific
const assignNotificationsRoleHandler = new MessageReactionAdd.AssignRoleHandler(roleName, listeningMessage, '✅', logger);
const requestTrainingEventHandler = new MessageReactionAdd.RequestTrainingHandler(requestTrainingMessageId, '🗒️', trainingRequestChannelId, discordClient.getTextChannel.bind(discordClient), calendarUrl, vatsimApi, logger);

const messageReactionAddEventHandlers = [assignNotificationsRoleHandler, requestTrainingEventHandler];
const messageReactionAddEventManager = new MessageReactionAdd.EventManager(messageReactionAddEventHandlers, logger);

/******** Messsage Reaction Remove ********/
const revokeNotificationsRoleHandler = new MessageReactionRemove.RevokeRoleHandler(roleName, listeningMessage, '✅', logger);

const messageReactionRemoveEventHandlers = [revokeNotificationsRoleHandler];
const messageReactionRemoveEventManager = new MessageReactionRemove.EventManager(messageReactionRemoveEventHandlers, logger);

/******** Add Hooks to DiscordClient ********/

discordClient.addHooks(messageReactionAddEventManager.getHooks())
    .addHooks(messageReactionRemoveEventManager.getHooks());

/******** Start ********/
discordClient.start();
