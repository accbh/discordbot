// import moment from 'moment';
// import { Message, User, PartialUser, Role, GuildMember, MessageReaction, MessageEmbed, TextChannel } from 'discord.js';


// import { Hook } from './models';
// import { Logger } from './logger';
// import { VatsimApi } from './vatsim';
// import { ATCRatings, PilotRATINGS } from './ratings';

// export function getHooks(tag: string, listeningMessage: string, trainingMessageChannel: string[], roleName: string, developers: string[], prefix: string, welcomeMsg: string, vatsimApi: VatsimApi, logger: Logger): Hook[] {
//     return [{
//     //     name: 'messageReactionAdd',
//     //     listener: (messageReaction, user) => {
//     //         if (messageReaction.emoji.name !== '✅' || user.bot || messageReaction.message.id !== listeningMessage) {
//     //             return;
//     //         }

//     //         Promise.resolve()
//     //             .then(() => extractMessageProps(messageReaction.message, user, roleName))
//     //             .then(props => props.member.roles.add(props.role))
//     //             .then(() => {
//     //                 logger.info(`Role added to ${user.username} (${user.id})`);
//     //             }, () => {
//     //                 logger.error(`Role ${roleName} doesn't exist.`);
//     //             });
//     //     }
//     // }, {
//     //     name: 'messageReactionAdd',
//     //     listener: (messageReaction, user) => {
//     //         if (messageReaction.emoji.name !== '🗒️' || user.bot || messageReaction.message.channel.id !== trainingMessageChannel) {
//     //             return;
//     //         }

//     //         giveTraining(user, messageReaction, vatsimApi)
//     //             .then(() => messageReaction.message.reactions.removeAll().catch(error => logger.error(`Error removing reactions to message ${messageReaction.message.id}: ${error}`)))
//     //             .then(() => messageReaction.message.react('🗒️'))
//     //             .then(() => {
//     //                 logger.info(`Training requested by ${user.username} (${user.id})`);
//     //             }, () => {
//     //                 logger.error(`Training unsuccessful for ${user.username} (${user.id})`);
//     //             });
//     //     }
//     // }, {
//     //     name: 'messageReactionRemove',
//     //     listener: (messageReaction, user) => {
//     //         if (messageReaction.emoji.name !== '✅' || messageReaction.message.id !== listeningMessage) {
//     //             //logger.info(`Reaction removed from message with ID ${messageReaction.message.channel.id} by ${user.username} (${user.id}) but it was not a tick, or it was not added to the correct message.`);
//     //             return;
//     //         }

//     //         Promise.resolve()
//     //             .then(() => extractMessageProps(messageReaction.message, user, roleName)) 
//     //             .then(props => props.member.roles.remove(props.role))
//     //             .then(() => {
//     //                 logger.info(`Role removed from ${user.username} (${user.id}).`);
//     //             }, () => {
//     //                 logger.error(`Role ${roleName} does not exist in server.`);
//     //             });
//     //     }
//     // }, {
//         name: 'message',
//         listener: (msg: Message) => {
//             const allowedUsers = developers;
//             const msgMatchesPrefix = !msg.content.indexOf(prefix);
//             const authorIsAllowed = allowedUsers.includes(msg.author.id);
        
//             if (!msgMatchesPrefix || !authorIsAllowed) return;
        
//             const args = msg.content.slice(prefix.length).trim().split(/ +/);
//             const command = args.shift().toLowerCase();

//             switch (command) {
//                 case 'testwelcome':
//                     msg.author.send(welcomeMsg);

//                     logger.info(`Welcome message sent to ${msg.author.username} (${msg.author.id}).`);
//                     return;
//                 case 'check':
//                     return developers.forEach(developer => {
//                         if (!msg.guild.members.cache.has(developer)) {
//                             msg.channel.send(':x: - User perms not found!');
//                             logger.error('User ran check command but did not have correct perms!');
//                             return;
//                         }
                        
//                         const mention = msg.mentions.members.first();

//                         getVATSIMUser(vatsimApi, mention)
//                             .then(data => {
//                                 const reg_date = new Date(data['reg_date']).toUTCString();
//                                 const vacc = data['subdivision'] === 'BHR' ? 'Home (Bahrain/BHR)' : data['subdivision'];

//                                 const name = `${data['name_first']} ${data['name_last']}`;
//                                 const atcRatings = ATCRatings[data['rating']];
//                                 const pilotRating = PilotRATINGS[`P${data['pilotrating']}`];

//                                 const embed = new MessageEmbed()
//                                     .setAuthor(`${mention.nickname ? mention.nickname : mention.user.username}`, mention.user.avatarURL())
//                                     .setDescription(`
//                                         CID: **${data['id']} (${name})**
//                                         vACC: **${vacc}**
//                                         Reg Date: **${reg_date}**
//                                         Controller Rating: **${atcRatings}**
//                                         Pilot Rating: **${pilotRating}** 
//                                     `);

//                                 // We add a p cause idk what else
//                                 msg.channel.send(embed);
//                                 //logger.info(`Role that we checked for was in the user's role array, VATSIM data has been given!`);
//                             });
//                     });
//             }
//         }
//     }, {
//         name: 'guildMemberAdd',
//         listener: (member) => {
//             member.send(welcomeMsg);
//             logger.info(`${member} has joined! The welcome info was sent.`);
//         }
//     }];
// }

// /**
//  * Grabs member that reacted to a message and the role that will be assigned to them.
//  * @param message Message that was reacted to.
//  * @param user User that reacted.
//  * @param roleName Name of the role we want to add to the user that reacted.
//  */
// const extractMessageProps = (message: Message, user: User | PartialUser, roleName: string): { member: GuildMember, role: Role } => {
//     return {
//         member: message.guild.member(user.id),
//         role: message.guild.roles.cache.find(x => x.name === roleName)
//     };
// };

// const parseUserCID = (user: GuildMember): string => {
//     const nickname = user?.nickname;
//     if (!nickname)
    
//     return nickname.substring(nickname.length - 7);
// };

// const giveTraining = (reactionUser: User | PartialUser, reaction: MessageReaction, vatsimApi: VatsimApi): Promise<void> => {
//     let embed = new MessageEmbed()
//         .setAuthor('Thanks for your request!', reactionUser.avatarURL())
//         .setDescription(`
//             Please enter a date that you are available for training.
//             Format: **DD/MM/YYYY**
//         `);

//     const filter = m => !!m.content.length;
//     const answers = [];
//     const member = reaction.message.guild.members.cache.get(reactionUser.id);
//     const memberCID = parseUserCID(member);

//     return reactionUser.send(embed)
//         .then(() => reactionUser.dmChannel.awaitMessages(filter, { max: 1, time: 600000 * 3, errors: ['time'] }))
//         .then(async collect => {
//             answers.push({ time: collect.first().content });

//             embed.setAuthor('Okay, we\'ve received that!', reactionUser.avatarURL())
//                 .setDescription(`
//                     If needed, please specify a note for the instructor.
//                     If not, please write \`None\`
//                 `);

//             return reactionUser.send(embed);
//         })
//         .then(() => reactionUser.dmChannel.awaitMessages(filter, { max: 1, time: 600000 * 3, errors: ['time'] }))
//         .then(collected => {
//             answers.push({ note: collected.first().content });
            
//             embed.setAuthor('Thanks!', reactionUser.avatarURL())
//                 .setDescription(`
//                     We have now sent that over to the instructors!
//                     **Sit back and relax whilst we sort something out!**
//                 `);

//             return reactionUser.send(embed);
//         })
//         .then(async() => {
//             const note = answers[1].note.length > 0 ? answers[1].note : 'None';
//             const date = moment(answers[0].time, 'DD/MM/YYYY', true).isValid();

//             //TODO - pick up from here

//             if (!date) {
//                 // TODO: tell the user the date is incorrect and ask for a new
//                 logger.info('Date is incorrect for the user!');
//                 return;
//             }

//             await getVATSIMUser(vatsimApi, member)
//                 .then(async data => {
//                     embed.setAuthor('New Training Request!', reactionUser.avatarURL())
//                         .setDescription(`
//                             **${member.user.username} (${memberCID})** has requested training.
//                             Date: **${answers[0].time}**
//                             Note: **${note}**
//                             Rating: **${ATCRatings[data['rating']]}**

//                             Add to Google Calendar Here: **[Here](${url + answers[0].time.split('/')[2] + answers[0].time.split('/')[1] + answers[0].time.split('/')[0] + 'T100000Z%2F' +  answers[0].time.split('/')[2] + answers[0].time.split('/')[1] + answers[0].time.split('/')[0] + 'T220000Z'})**
//                         `);

//                     await (client.channels.cache.get(logChannel) as TextChannel).send(embed);
//                 });
//         });

// // logger.log(reactionUser.username, LogLevel.INFO);
// };

// const getVATSIMUser = (vatsimApi: VatsimApi, user: GuildMember): Promise<any> => {
//     return vatsimApi.getApiInstance()
//         .then(apiInstance => {
//             const cid = parseUserCID(user);
//             return vatsimApi.getVATSIMUser(apiInstance, cid);
//         });
// };


// // /**
// //  * Welcomes a user by sending them a private message.
// //  */
// // client.on('guildMemberAdd', member => {
// //     member.send(welcomeMsg);
// //     logger.info(`${member} has joined! The welcome info was sent.`);
// // });

// // /**
// //  * Handles commands
// //  */
// // client.on('message', (msg: Message) => {

// //     const allowedUsers = developers;
// //     const msgMatchesPrefix = !msg.content.indexOf(prefix);
// //     const authorIsAllowed = allowedUsers.includes(msg.author.id);

// //     if (!msgMatchesPrefix || !authorIsAllowed) return;

// //     const args = msg.content.slice(prefix.length).trim().split(/ +/);
// //     const command = args.shift().toLowerCase();
    
// //     if (command === 'testwelcome') {
// //         msg.author.send(welcomeMsg);
// //         logger.info(`Welcome message sent to ${msg.author.username} (${msg.author.id}).`);
// //     }



// //     if (command === 'check') {
// //         const checkArray = developers;
// //         for (const user of checkArray) {
// //             if (msg.guild.members.cache.has(user)) {
// //                 const mention = msg.mentions.members.first();
// //                 getVATSIMUser(mention).then(data => {
// //                     const reg_date = new Date(data['reg_date']).toUTCString();
// //                     const vacc = data['subdivision'] === 'BHR' ? 'Home (Bahrain/BHR)' : data['subdivision'];
// //                         const embed = new MessageEmbed()
// //                         .setAuthor(`${mention.nickname ? mention.nickname : mention.user.username}`, mention.user.avatarURL())
// //                         .setDescription(`
// //                         CID: **${data['id']} (${data['name_first'] + ' ' + data['name_last']})**
// //                         vACC: **${vacc}**
// //                         Reg Date: **${reg_date}**
// //                         Controller Rating: **${ATCRatings[data['rating']]}**
// //                         Pilot Rating: **${PilotRATINGS['P' + data['pilotrating']]}** 
// //                         `);
// //                         // We add a p cause idk what else
// //                         msg.channel.send(embed);
// //                         logger.info(`Role that we checked for was in the user's role array, VATSIM data has been given!`);
// //                 });
// //                     break;
// //             } else {
// //                 msg.channel.send(':x: - User perms not found!');
// //                 logger.error('User ran check command but did not have correct perms!');
// //             }
// //         }
        
// //     }


// // });

// // client.login(token);


// // import moment from 'moment';
// // import { Client, Message, User, PartialUser, GuildMember, MessageEmbed, MessageReaction, TextChannel, ClientEvents } from 'discord.js';
// // import { ATCRatings, PilotRATINGS } from './ratings';

// // client.on('ready', () => {
// //     /*
// //     const reactChannel = "trainingMessageChannel"; //pulled from json
// //     (client.channels.cache.get(reactChannel) as TextChannel).messages.fetch({ limit: 1 }).then(async Msg => {
// //         const firstMessage = Msg.first();
// //         await firstMessage.react(`🗒️`);
// //     })
// //     */ 
// //    //Trying to add in some auto functionality. WIP
// //    //bot will remove the reaction once the user gets a private message

// //     logger.verbose(`Online as ${client.user.tag}`;
// // });

// // /**
// //  *  Reaction to add role.
// //  */
// // client.on('messageReactionAdd', async(messageReaction, user) => {

// //     if (messageReaction.emoji.name === '✅' && !user.bot) {

// //         if (messageReaction.message.id === listeningMessage) {
            
// //             try {
// //                 const { member, role } = extractMessageProps(messageReaction.message, user, roleName);
// //                 await member.roles.add(role);
// //                 logger.info(`Role added to ${user.username} (${user.id})`);
// //             } catch (err) {
// //                 logger.error(`Role ${roleName} doesn't exist.`);
// //             }  

// //         } 
// //     } else if (messageReaction.emoji.name === '🗒️' && !user.bot) {
// //         if (messageReaction.message.channel.id === trainingMessageChannel || '710845936045391902') {
// //             try {
// //                 giveTraining(user, messageReaction);
// //                 messageReaction.message.reactions.removeAll().catch(error => logger.error(`Error removing reactions to message ${messageReaction.message.id}: ${error}`));
// //                 await messageReaction.message.react('🗒️');
// //                 logger.info(`Training requested by ${user.username} (${user.id})`);
// //             } catch (err) {
// //                 logger.error(`Training unsuccessful for ${user.username} (${user.id})`);
// //             }
// //         }
// //     } else {
// //         logger.log(`Reaction added to message with ID ${messageReaction.message.channel.id} by ${user.username} (${user.id}) but it was not a tick or training request.`, LogLevel.INFO);
// //     }

// // });

// // /**
// //  *  Reaction to remove role.
// //  */
// // client.on('messageReactionRemove', async(messageReaction, user) => {

// //     if (messageReaction.emoji.name === '✅') {

// //         if (messageReaction.message.id === listeningMessage) {
            
// //             try {
// //                 const { member, role } = extractMessageProps(messageReaction.message, user, roleName); 
// //                 await member.roles.remove(role);
// //                 logger.info(`Role removed from ${user.username} (${user.id}).`);
// //             } catch (err) {
// //                 logger.error(`Role ${roleName} doesn't exist.`);
// //             }      

// //         }
// //     } else {
// //         logger.info(`Reaction removed from message with ID ${messageReaction.message.channel.id} by ${user.username} (${user.id}) but it was not a tick.`);
// //     }

// // });
