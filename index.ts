import { Client, Message } from 'discord.js';
import { Logger, LogLevel, LogLevelValue, ConsoleLogger } from './lib/logger';
import { token, listeningMessage, prefix } from './config.json';

const logger:Logger = new ConsoleLogger(LogLevelValue.INFO);
const client = new Client({ partials: ['MESSAGE', 'USER', 'REACTION'] });

client.on('ready', () => {
    logger.log(`Online as ${client.user.tag}`, LogLevel.VERBOSE);  
});

// REACTION TO ADD ROLE

client.on('messageReactionAdd', (messageReaction, user) => {

    if(messageReaction.emoji.name === "✅") {

        if (messageReaction.message.id === listeningMessage) {
            
            try {
                logger.log(`Role added to ${user.username} (${user.id})`, LogLevel.INFO)
                messageReaction.message.guild.member(user.id).roles.add(editRole(messageReaction));
            } catch(err) {
                logger.log("Role doesn't exist. Failed to return satisfactory result from editRole.", LogLevel.ERROR);
            }  

        } 
    } else {
        logger.log("Reaction added but it was not a tick.", LogLevel.INFO)
    }
});

client.on('messageReactionRemove', (messageReaction, user) => {

    if(messageReaction.emoji.name === "✅") {

        if (messageReaction.message.id === listeningMessage) {
            
            try {
                logger.log(`Role removed from ${user.username} (${user.id}).`, LogLevel.INFO)
                messageReaction.message.guild.member(user.id).roles.remove(editRole(messageReaction));
            } catch(err) {
                logger.log("Role doesn't exist. Failed to return satisfactory result from editRole.", LogLevel.ERROR);
            }      

        }
    } else {
        logger.log("Reaction removed but it was not a tick.", LogLevel.INFO)
    }
});

const editRole = (reaction) => {
    let roleName = 'Moffie';
    let role = reaction.message.guild.roles.cache.find(x => x.name == roleName);
    if (typeof role === undefined) {
        logger.log(`Role ${roleName} does not exist!`, LogLevel.ERROR)
    } else {
        return role;
    }
};

// WELCOME A USER

client.on('guildMemberAdd', member => {
    logger.log(`${member} has joined! The welcome info was sent.`, LogLevel.INFO);
    member.send("Test");
});

// DEV FOR WELCOMING A USER
client.on('message', (msg: Message) => {

    const allowedUsers = ['574333819017101312', '167764605957832704'];
    const msgMatchesPrefix = !msg.content.indexOf(prefix);
    const authorIsAllowed = allowedUsers.includes(msg.author.id);

    if (!msgMatchesPrefix || !authorIsAllowed) return;

	const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command === 'testwelcome') {
        msg.author.send("Test worked.");
        logger.log(`Message sent to ${msg.author.username} (${msg.author.id}).`, LogLevel.INFO);
    } else {
        return;
    }
});

client.login(token);