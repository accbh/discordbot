/**

    Name: index.ts
    Version: 1.0.1
    Author: Liam P, Gavin v. G, Harrison D.
    Date: 04/09/2020
    Description: Main bot code. Will handle commands, reactions and users joining the server.

**/

import { Client, Message, User, PartialUser, GuildMember, MessageEmbed, MessageReaction, TextChannel} from 'discord.js';
import { Logger, LogLevel, LogLevelValue, ConsoleLogger } from './lib/logger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ATCRatings, PilotRATINGS } from './lib/ratings';
import moment from 'moment';
import axios from 'axios';
//import { token, listeningMessage, prefix, roleName, welcomeMsg, developers } from '../config.json';

const configContent = readFileSync(join(__dirname, '../config.json')).toString();
const { token, listeningMessage, prefix, roleName, welcomeMsg, developers, logChannel, trainingMessageChannel } = JSON.parse(configContent);

const logger: Logger = new ConsoleLogger(LogLevelValue.INFO);
const client = new Client({ partials: ['MESSAGE', 'USER', 'REACTION'] });

client.on('ready', () => {
    /*
    const reactChannel = "trainingMessageChannel"; //pulled from json
    (client.channels.cache.get(reactChannel) as TextChannel).messages.fetch({ limit: 1 }).then(async Msg => {
        const firstMessage = Msg.first();
        await firstMessage.react(`🗒️`);
    })
    */ 
   //Trying to add in some auto functionality. WIP
   //bot will remove the reaction once the user gets a private message

    logger.log(`Online as ${client.user.tag}`, LogLevel.VERBOSE);
});

/**
 *  Reaction to add role.
 */
client.on('messageReactionAdd', async(messageReaction, user) => {

    if (messageReaction.emoji.name === '✅' && !user.bot) {

        if (messageReaction.message.id === listeningMessage) {
            
            try {
                const { member, role } = extractMessageProps(messageReaction.message, user, roleName);
                await member.roles.add(role);
                logger.log(`Role added to ${user.username} (${user.id})`, LogLevel.INFO);
            } catch (err) {
                logger.log(`Role ${roleName} doesn't exist.`, LogLevel.ERROR);
            }  

        } 
    } else if (messageReaction.emoji.name === '🗒️' && !user.bot) {
        if (messageReaction.message.channel.id === trainingMessageChannel) {
            try {
                giveTraining(user, messageReaction);
                messageReaction.message.reactions.removeAll().catch(error => logger.log(`Error removing reactions to message ${messageReaction.message.id}: ${error}`, LogLevel.ERROR));
                logger.log(`Training requested by ${user.username} (${user.id})`, LogLevel.INFO);
            } catch (err) {
                logger.log(`Training unsuccessful for ${user.username} (${user.id})`, LogLevel.ERROR);
            }
        }
    } else {
        logger.log(`Reaction added to message with ID ${messageReaction.message.channel.id} by ${user.username} (${user.id}) but it was not a tick or training request.`, LogLevel.INFO);
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
        logger.log(`Reaction removed from message with ID ${messageReaction.message.channel.id} by ${user.username} (${user.id}) but it was not a tick.`, LogLevel.INFO);
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
 * Just grabs the CID from a nickname easier than writing more lines of code.
 * Format of the nickname needs to be like:
 * xxx - CID (Just making sure the CID is last I guess, so the client can pick it up correctly)
 * @param user Message that was reacted to.
 */

const parseUserCID = (user: GuildMember) => {
    const username = user.nickname ? user.nickname : user.user.username;
    const cid = username.substring(username.length - 7);
    return cid;
};

const giveTraining = async(reactionUser: User | PartialUser, reaction: MessageReaction) => {
    let embed = new MessageEmbed()
    .setAuthor('Thanks for requesting!', reactionUser.avatarURL())
    .setDescription(`
    To request your training, please enter the date you would like this training.
    Format: **DD/MM/YYYY**
    `);
    let filter = m => m.content.length > 0;
    let answers = [];
    const member = reaction.message.guild.members.cache.get(reactionUser.id);
    const memberCID = parseUserCID(member);

    await reactionUser.send(embed);
    await reactionUser.dmChannel.awaitMessages(filter, { max: 1, time: 600000 * 3, errors: ['time'] })
    .then(async collect => {
        answers.push({time: collect.first().content});
        embed.setAuthor('Okay, we\'ve received that!', reactionUser.avatarURL());
        embed.setDescription(`
        If needed, please specify a note for the instructor.
        If not, please specific \`None\`
        `);
        await reactionUser.send(embed);
        await reactionUser.dmChannel.awaitMessages(filter, { max: 1, time: 600000 * 3, errors: ['time'] })
        .then(async collected => {
            answers.push({note: collected.first().content});
            embed.setAuthor('Thanks!', reactionUser.avatarURL());
            embed.setDescription(`
                We have now sent that over to the instructors!
                **Sit back and relax, whilst we sort something out!**
            `);
            await reactionUser.send(embed);
            const note = await answers[1].note.length > 0 ? answers[1].note : 'None';
            const date = await moment(answers[0].time, 'DD/MM/YYYY', true).isValid();

            if (date) {
            await getVATSIMUser(member).then(async data => {
            embed.setAuthor('New Training Request!', reactionUser.avatarURL());
            embed.setDescription(`
            **${member.user.username} (${memberCID})** has requested training.
            Date: **${answers[0].time}**
            Note: **${note}**
            Rating: **${ATCRatings[data['rating']]}**
            `);
            await (client.channels.cache.get(logChannel) as TextChannel).send(embed);
            });
        } else {
            logger.log('Date is incorrect for the user!', LogLevel.INFO);
        }

        });
    });
    

// logger.log(reactionUser.username, LogLevel.INFO);
};

const getVATSIMUser = (user: GuildMember) => {
    const cid = parseUserCID(user);
    const obj = axios.get('https://api.vatsim.net/api/ratings/' + cid)
    .then(res => {
        if (res.status === 200) {
            return res.data;
        } else {
            return {
                error: 'Not working!'
            };
        }
    }).catch(err => {
        if (err.response.status === 404) {
            logger.log('Error with getting VATSIM User Data (404)', LogLevel.ERROR);
        } else {
        logger.log('Error with getting VATSIM User Data (N/A)', LogLevel.ERROR);
        }
    });
    return obj; //Axios is gonna return a promise
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
    }



    if (command === 'check') {
        const checkArray = developers;
        for (const role of checkArray) {
            if (msg.member.roles.cache.has(role)) {
                const mention = msg.mentions.members.first();
                getVATSIMUser(mention).then(data => {
                    const reg_date = new Date(data['reg_date']).toUTCString();
                    const vacc = data['subdivision'] === 'BHR' ? 'Home (Bahrain/BHR)' : data['subdivision'];
                        const embed = new MessageEmbed()
                        .setAuthor(`${mention.nickname ? mention.nickname : mention.user.username}`, mention.user.avatarURL())
                        .setDescription(`
                        CID: **${data['id']} (${data['name_first'] + ' ' + data['name_last']})**
                        vACC: **${vacc}**
                        Reg Date: **${reg_date}**
                        Controller Rating: **${ATCRatings[data['rating']]}**
                        Pilot Rating: **${PilotRATINGS['P' + data['pilotrating']]}** 
                        `);
                        // We add a p cause idk what else
                        msg.channel.send(embed);
                        logger.log(`Role that we checked for was in the user's role array, VATSIM data has been given!`, LogLevel.INFO);
                });
                    break;
            }
        }
        
    }


});

client.login(token);
