/**

    Name: index.ts
    Version: 1.0.1
    Author: Liam P, Gavin v. G
    Date: 21/07/2020
    Description: Main bot code. Will handle commands, reactions and users joining the server.

**/

import { Client, Message, User, PartialUser } from 'discord.js';
import { Logger, LogLevel, LogLevelValue, ConsoleLogger } from './lib/logger';
import { readFileSync } from 'fs';
import { join } from 'path'
//import { token, listeningMessage, prefix, roleName, welcomeMsg, developers } from '../config.json';

const configContent = readFileSync(join(__dirname, '../config.json')).toString();
const { token, listeningMessage, prefix, roleName, welcomeMsg, developers } = JSON.parse(configContent);

const logger: Logger = new ConsoleLogger(LogLevelValue.INFO);
const client = new Client({ partials: ['MESSAGE', 'USER', 'REACTION'] });

client.on('ready', () => {
    logger.log(`Online as ${client.user.tag}`, LogLevel.VERBOSE);  
});

/**
 *  Reaction to add role.
 */
client.on('messageReactionAdd', async(messageReaction, user) => {

    if (messageReaction.emoji.name === '✅') {

        if (messageReaction.message.id === listeningMessage) {
            
            try {
                const { member, role } = extractMessageProps(messageReaction.message, user, roleName);
                await member.roles.add(role);
                logger.log(`Role added to ${user.username} (${user.id})`, LogLevel.INFO);
            } catch (err) {
                logger.log(`Role ${roleName} doesn't exist.`, LogLevel.ERROR);
            }  

        } 
    } else {
        logger.log('Reaction added but it was not a tick.', LogLevel.INFO);
    }
});

/**
 *  Reaction to remove role.
 */
client.on('messageReactionRemove', async(messageReaction, user) => {

    if (messageReaction.emoji.name === '✅') {

        if (messageReaction.message.id === listeningMessage) {
            
            try {
                const { member, role } = extractMessageProps(messageReaction.message, user, roleName); 
                await member.roles.remove(role);
                logger.log(`Role removed from ${user.username} (${user.id}).`, LogLevel.INFO);
            } catch (err) {
                logger.log(`Role ${roleName} doesn't exist.`, LogLevel.ERROR);
            }      

        }
    } else {
        logger.log('Reaction removed but it was not a tick.', LogLevel.INFO);
    }
});

/**
 * Grabs member that reacted to a message and the role that will be assigned to them.
 * @param message Message that was reacted to.
 * @param user User that reacted.
 * @param roleName Name of the role we want to add to the user that reacted.
 */
const extractMessageProps = (message: Message, user: User | PartialUser, roleName: string) => {

    return {
        member: message.guild.member(user.id),
        role: message.guild.roles.cache.find(x => x.name === roleName)
    };

};

/**
 * Welcomes a user by sending them a private message.
 */
client.on('guildMemberAdd', member => {
    member.send(welcomeMsg);
    logger.log(`${member} has joined! The welcome info was sent.`, LogLevel.INFO);
});

/**
 * Developer version for sending a welcome message. Will fire if a developer sends the command ¬testwelcome.
 */
client.on('message', (msg: Message) => {

    const allowedUsers = developers;
    const msgMatchesPrefix = !msg.content.indexOf(prefix);
    const authorIsAllowed = allowedUsers.includes(msg.author.id);

    if (!msgMatchesPrefix || !authorIsAllowed) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command === 'testwelcome') {
        msg.author.send(welcomeMsg);
        logger.log(`Welcome message sent to ${msg.author.username} (${msg.author.id}).`, LogLevel.INFO);
    } else {
        return;
    }
});

client.login(token);
