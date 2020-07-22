import { Client, RoleManager, GuildMember, ReactionCollector } from 'discord.js';
import { Logger, LogLevel, LogLevelValue, ConsoleLogger } from './lib/logger';
import { token, listeningMessage } from './config.json';

const logger = new ConsoleLogger(LogLevelValue.INFO);
const client = new Client({ partials: ['MESSAGE', 'USER', 'REACTION'] });

client.on('ready', () => {

    logger.log(`Online as ${client.user.tag}`, LogLevel.VERBOSE);
    
});

// REACTION TO ADD ROLE

client.on('messageReactionAdd', (messageReaction, user) => {
    //let { id } = messageReaction.message; //why { id }

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
    //let { id } = messageReaction.message; //why { id }

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

// WELCOME A USER

client.on('guildMemberAdd', member => {



});

const editRole = (reaction) => {

    let roleName = 'Moffie';
    let role = reaction.message.guild.roles.cache.find(x => x.name == roleName);
    if (typeof role === undefined) {
        logger.log(`Role ${roleName} does not exist!`, LogLevel.ERROR)
    } else {
        return role;
    }

}

client.login(token);

