/**

    Name: index.ts
    Version: 1.0.1
    Author: Liam P, Gavin v. G, Harrison D.
    Date: 04/09/2020
    Description: Main bot code. Will handle commands, reactions and users joining the server.

**/

import { Client, Message, User, PartialUser, GuildMember, MessageEmbed } from 'discord.js';
import { Logger, LogLevel, LogLevelValue, ConsoleLogger } from './lib/logger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ATCRatings, PilotRATINGS } from './lib/ratings'
import axios from 'axios';
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

const parseUserCID = (user: GuildMember) => {
    const username = user.nickname ? user.nickname : user.user.username;
    const cid = username.substring(username.length - 7)
    return cid;
};

//its just gonna parse the id from the user's username for safe keeping
const getTraining = (user: GuildMember, message: Message) => {
    const msgArray = message.content.split(" ");  
    const args = msgArray.slice(1);

    const time = args[1]; //could just use the args variable here but im a savage
    const note = "test"

const cid = parseUserCID(message.member);

    return {
        cid: cid,
        note: note,
        time: time,
        user: user
    };
};

const getVATSIMUser = (user: GuildMember) => {
    const cid = parseUserCID(user);
    const obj = axios.get("https://api.vatsim.net/api/ratings/" + cid)
    .then(res => {
        if(res.status == 200) {
            return res.data;
        } else {
            return {
                error: "Not working!"
            };
        }
    }).catch(err => {
        if(err.response.status == 404) {
            logger.log("Error with getting VATSIM User Data (404)", LogLevel.ERROR);
        } else {
        logger.log("Error with getting VATSIM User Data (N/A)", LogLevel.ERROR);
        }
    })
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

    if(command === 'training') {
        const { cid, time, note, user } = getTraining(msg.member, msg);
        const date = new Date(time)
        const parsedDate = date.toTimeString();

        if(cid && parsedDate && note) {
            const embed = new MessageEmbed()
            .setAuthor("Successful request!", msg.author.avatarURL())
            .setDescription(`
            Date: **${date}**
            Note: **${note}**
            `)

            msg.channel.send(embed);

            logger.log(`Training has been requested by ${cid} (${user.nickname})`, LogLevel.INFO)
        } else {
            logger.log(`Some of the data needed for a training request has not been provided!`, LogLevel.WARN)
        }

        msg.channel.send(cid);
        logger.log(`Got CID: ${cid}`, LogLevel.INFO)
    }

    if(command === 'check') {
        const checkArray = ['732920005372411983', '736025391617015919', '710850836313407589']
        for(const role of checkArray) {
            if(msg.member.roles.cache.has(role)) {
                const mention = msg.mentions.members.first();
                getVATSIMUser(mention).then(data => {
                    const reg_date = new Date(data["reg_date"]).toUTCString()
                    const vacc = data["subdivision"] == 'BHR' ? 'Home (Bahrain/BHR)' : data["subdivision"];
                        const embed = new MessageEmbed()
                        .setAuthor(`${mention.nickname ? mention.nickname : mention.user.username}`, mention.user.avatarURL())
                        .setDescription(`
                        CID: **${data["id"]} (${data["name_first"] + ' ' + data["name_last"]})**
                        vACC: **${vacc}**
                        Reg Date: **${reg_date}**
                        Controller Rating: **${ATCRatings[data["rating"]]}**
                        Pilot Rating: **${PilotRATINGS["P" + data["pilotrating"]]}** 
                        `)
                        // We add a p cause idk what to do lmao
                        msg.channel.send(embed);
                        logger.log(`Role that we checked for was in the user's role array, VATSIMData has been given!`, LogLevel.INFO)
                });
                    break;
            }
        }
        
    }


});

client.login(token);
