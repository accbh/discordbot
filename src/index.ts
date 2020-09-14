import { readFileSync } from 'fs';
import { join } from 'path';

import { jsonParser } from './lib/helpers';
import { Logger, LogLevelValue, ConsoleLogger } from './lib/logger';
import { VatsimApi } from './lib/vatsim';
import { EventManager as GenericEventManager, GuildMemberAdd, Message, MessageReactionAdd, MessageReactionRemove } from './events';
import { DiscordClient } from './discord-client';
import { Config } from './config';

// -----------------------------------------------------
// Argument Handling

const packageJsonContents = jsonParser(readFileSync(join(__dirname, '../package.json'), { encoding: 'utf8' }));
const config: Config = Config.fromArgs(process.argv, packageJsonContents);
if (config.help) {
    console.log(Config.getHelp());

    process.exit(0);
}

// -----------------------------------------------------
// Additional Resources
const logger: Logger = new ConsoleLogger(LogLevelValue[config.loglevel.toUpperCase()]);
const vatsimBaseUrl = 'https://api.vatsim.net';
const vatsimApi = new VatsimApi(vatsimBaseUrl, logger);

// -----------------------------------------------------
// Discord Client
const discordClient = new DiscordClient(config.discordToken, ['MESSAGE', 'USER', 'REACTION'], [], logger);

// -----------------------------------------------------
// Guild Member Add
const sendWelcomeMessageEventHandler = new GuildMemberAdd.SendWelcomeMessageHandler(config.newMemberWelcomeMessage, logger);

const guildMemberAddEventHandlers = [sendWelcomeMessageEventHandler];
const guildMemberAddEventManager = new GenericEventManager('guildMemberAdd', guildMemberAddEventHandlers, logger);

// -----------------------------------------------------
// Message
const checkEventHandler = new Message.CheckHandler(config.developerIds, vatsimApi, logger);
const testMessageEventHandler = new Message.TestMessageHandler(config.developerIds, config.newMemberWelcomeMessage, logger);

const messageEventHandlers = [checkEventHandler, testMessageEventHandler];
const messageEventManager = new Message.EventManager(messageEventHandlers, config.botCommandPrefix, logger);

// -----------------------------------------------------
// Message Reaction Add
const assignNotificationsRoleHandler = new MessageReactionAdd.AssignRoleHandler(config.notificationRoleName, config.notificationRoleMessageId, '✅', discordClient.extractMessageProps.bind(discordClient), logger);
const requestTrainingEventHandler = new MessageReactionAdd.RequestTrainingHandler(config.requestTrainingMessageId, '🗒️', config.requestTrainingChannelId, discordClient.getTextChannel.bind(discordClient), config.calendarUrl, vatsimApi, logger);

const messageReactionAddEventHandlers = [assignNotificationsRoleHandler, requestTrainingEventHandler];
const messageReactionAddEventManager = new GenericEventManager('messageReactionAdd', messageReactionAddEventHandlers, logger);

// -----------------------------------------------------
// Message Reaction Remove
const revokeNotificationsRoleHandler = new MessageReactionRemove.RevokeRoleHandler(config.notificationRoleName, config.notificationRoleMessageId, '✅', discordClient.extractMessageProps.bind(discordClient), logger);

const messageReactionRemoveEventHandlers = [revokeNotificationsRoleHandler];
const messageReactionRemoveEventManager = new GenericEventManager('messageReactionRemove', messageReactionRemoveEventHandlers, logger);

// -----------------------------------------------------
// Discord Client Hooks
discordClient
    .addHooks(guildMemberAddEventManager.getHooks())
    .addHooks(messageEventManager.getHooks())
    .addHooks(messageReactionAddEventManager.getHooks())
    .addHooks(messageReactionRemoveEventManager.getHooks());

// -----------------------------------------------------
// Init and Start
discordClient.start();
