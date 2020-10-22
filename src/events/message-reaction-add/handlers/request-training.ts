import moment from 'moment';
import { User, MessageReaction, TextChannel } from 'discord.js';

import { EventHandler } from '../types';
import { Logger } from '../../../lib/logger';
import { VatsimApi } from '../../../lib/vatsim';
import { ATCRatings } from '../../../types';
import { extractUserCidFromGuildMember, getVatsimUser, sendMessageToChannel, sendMessageToUser, removeUserFromMessageReaction } from '../../../lib/discord-helpers';

export class RequestTrainingHandler implements EventHandler {
    constructor(
        private readonly messageId: string,
        private readonly emojiName: string,
        private readonly trainingRequestChannelId: string,
        private readonly getTextChannel: (channelId) => TextChannel,
        private readonly calendarUrl: string,
        private readonly vatsimApi: VatsimApi,
        private readonly logger: Logger
    ) { }

    supported(messageReaction, user): boolean {
        return messageReaction.emoji.name === this.emojiName && !user.bot && messageReaction.message.id === this.messageId;
    }

    async handle(messageReaction: MessageReaction, user: User): Promise<void> {
        await removeUserFromMessageReaction(messageReaction, user)
            .then(() => this.giveTraining(user, messageReaction))
            .then(() => {
                this.logger.info(`Training requested by ${user.username} (${user.id})`);
            }, () => {
                this.logger.error(`Training request unsuccessful for ${user.username} (${user.id})`);
            });
    }

    // TODO - ask for a time in zulu (isikhathi sini)
    async giveTraining(requestor: User, reaction: MessageReaction): Promise<void> {
        const responseMessageFilter = m => !!m.content.length; // !!0 is falsey 
        const member = reaction.message.guild.members.cache.get(requestor.id);
        const memberCid = extractUserCidFromGuildMember(member);

        const answers = [];

        return sendMessageToUser('Thanks for your request!', 'Please enter a date that you are available for training.\nFormat: **DD/MM/YYYY**', requestor)
            .then(() => requestor.dmChannel.awaitMessages(responseMessageFilter, { max: 1, time: 1000 * 60 * 30, errors: ['time'] }))
            .then(async collect => {
                answers.push({ time: collect.first().content });
                return sendMessageToUser('Okay, we\'ve received that!', 'If needed, please specify a note for the instructor.\nIf not, please write \`None\`.', requestor);
            })
            .then(() => requestor.dmChannel.awaitMessages(responseMessageFilter, { max: 1, time: 1000 * 60 * 30, errors: ['time'] }))
            .then(collected => {
                answers.push({ note: collected.first().content });
                return sendMessageToUser('Thanks!', 'We have now sent that over to the instructors!\n**Sit back and relax whilst we sort something out!**', requestor);
            })
            .then(async () => {
                const note = answers[1].note.length > 0 ? answers[1].note : 'None';
                const date = moment(answers[0].time, 'DD/MM/YYYY', true);
                return { note, date };
            })
            .then(({ note, date }: { note: string, date: moment.Moment }) => {
                const isValidDate = date.isValid();
                if (!isValidDate) {
                    // TODO: tell the user the date is incorrect and ask for a new
                    this.logger.info('Date is incorrect for the user!');
                    return;
                }

                const clickableUrl = `${this.calendarUrl}${date.format('YYYYMMDD')}T100000Z%2F${date.format('YYYYMMDD')}T220000Z`;

                return getVatsimUser(this.vatsimApi, memberCid)
                    .then(async data => {
                        return sendMessageToChannel(
                            'New training request!',
                            `**${member.user.username} (${memberCid})** has requested training.
                            Date: **${date.format('DD/MM/YYYY')}**
                            Note: **${note}**
                            Rating: **${ATCRatings[data['rating']]}**
                            
                            Add to Google Calendar **[Here](${clickableUrl})**
                            `,
                            this.getTextChannel(this.trainingRequestChannelId),
                            requestor.avatarURL());
                    });
            });
    }

}
