import moment from 'moment';
import { User, PartialUser, GuildMember, MessageReaction, MessageEmbed, TextChannel } from 'discord.js';

import { EventHandler } from '../models';
import { Logger } from '../../../lib/logger';
import { VatsimApi } from '../../../lib/vatsim';
import { ATCRatings } from '../../../lib/ratings';

export class RequestTrainingHandler implements EventHandler {
    constructor(
        private readonly messageId: string,
        private readonly emojiName: string,
        private readonly trainingRequestChannelId: string,
        private readonly getTextChannel: (channelId) => TextChannel,
        private readonly calendarUrl: string,
        private readonly vatsimApi: VatsimApi,
        private readonly logger: Logger
    ) {}

    supported(messageReaction, user): boolean {
        return messageReaction.emoji.name === this.emojiName && !user.bot && messageReaction.message.id === this.messageId;
    }

    handle(messageReaction, user): Promise<void> {
        return this.giveTraining(user, messageReaction)
            .then(() => messageReaction.message.reactions.removeAll().catch(error => this.logger.error(`Error removing reactions to message ${messageReaction.message.id}: ${error}`)))
            .then(() => messageReaction.message.react('🗒️'))
            .then(() => {
                this.logger.info(`Training requested by ${user.username} (${user.id})`);
            }, () => {
                this.logger.error(`Training unsuccessful for ${user.username} (${user.id})`);
            });
    }

    parseUserCID(user: GuildMember): string {
        const nickname = user?.nickname;
        if (!nickname) {
            // TODO - Throw an error or add some early exit code
            throw Error('Oops');
        }
        
        return nickname.substring(nickname.length - 7);
    }

    getVATSIMUser(vatsimApi: VatsimApi, user: GuildMember): Promise<any> {
        return vatsimApi.getApiInstance()
            .then(apiInstance => {
                const cid = this.parseUserCID(user);
                return vatsimApi.getVATSIMUser(apiInstance, cid);
            });
    }

    // TODO - ask for a time in zulu (isikhathi sini)
    async giveTraining(requestor: User | PartialUser, reaction: MessageReaction): Promise<void> {
        const responseMessageFilter = m => !!m.content.length; // !!0 is falsey 
        const member = reaction.message.guild.members.cache.get(requestor.id);
        const memberCID = this.parseUserCID(member);

        const answers = [];
    
        return this.sendMessageToUser('Thanks for your request!', 'Please enter a date that you are available for training.\nFormat: **DD/MM/YYYY**', requestor)
            .then(() => requestor.dmChannel.awaitMessages(responseMessageFilter, { max: 1, time: 1000 * 60 * 30, errors: ['time'] }))
            .then(async collect => {
                answers.push({ time: collect.first().content });
                return this.sendMessageToUser('Okay, we\'ve received that!', 'If needed, please specify a note for the instructor.\nIf not, please write \`None\`.', requestor);
            })
            .then(() => requestor.dmChannel.awaitMessages(responseMessageFilter, { max: 1, time: 1000 * 60 * 30, errors: ['time'] }))
            .then(collected => {
                answers.push({ note: collected.first().content });    
                return this.sendMessageToUser('Thanks!', 'We have now sent that over to the instructors!\n**Sit back and relax whilst we sort something out!**', requestor);
            })
            .then(async() => {
                const note = answers[1].note.length > 0 ? answers[1].note : 'None';
                const date = moment(answers[0].time, 'DD/MM/YYYY', true);
                return { note, date};
            })
            .then(({ note, date }: { note: string, date: moment.Moment }) => {
                const isValidDate = date.isValid();
                if (!isValidDate) {
                    // TODO: tell the user the date is incorrect and ask for a new
                    this.logger.info('Date is incorrect for the user!');
                    return;
                }

                //https://www.google.com/calendar/render?action=TEMPLATE&text=Bahrain+vACC+Training&details=Training+Session+-+Generated+by+Jarvis&dates=
                const clickableUrl = `${this.calendarUrl}${date.format('YYYYMMDD')}T100000Z%2F${date.format('YYYYMMDD')}T220000Z`; 

                return this.getVATSIMUser(this.vatsimApi, member)
                    .then(async data => {
                        
                        return this.sendMessageToChannel(
                            'New training request!',
                            `**${member.user.username} (${memberCID})** has requested training.
                            Date: **${date.format('DD/MM/YYYY')}**
                            Note: **${note}**
                            Rating: **${ATCRatings[data['rating']]}**
                            
                            Add to Google Calendar **[Here](${clickableUrl})**
                            `,
                            this.getTextChannel(this.trainingRequestChannelId),
                            requestor.avatarURL());
                    }); 
            });
    
    // logger.log(requestor.username, LogLevel.INFO);
    }

    private async sendMessageToUser(header: string, message: string, user: User | PartialUser): Promise<void> {
        // Should we be sending the bot's avatar instead?
        const embeddedMessage = this.constructEmbeddedMessage(header, message, user.avatarURL());
        await user.send(embeddedMessage);
    }

    private async sendMessageToChannel(header: string, message: string, channel: TextChannel, avatarUrl): Promise<void> {
        const embeddedMessage = this.constructEmbeddedMessage(header, message, avatarUrl);
        await channel.send(embeddedMessage);
    }

    private constructEmbeddedMessage(header: string, message: string, avatarUrl: string): MessageEmbed {
        return new MessageEmbed()
            .setAuthor(`${header}`, avatarUrl)
            .setDescription(message);
    }

}
