import { Message, GuildMember, TextChannel, MessageEmbed } from 'discord.js';

import { EventHandler } from '../models';
import { Logger } from '../../../lib/logger';
import { VatsimApi } from '../../../lib/vatsim';
import { ATCRatings, PilotRatings } from '../../../lib/ratings';

export class CheckHandler implements EventHandler {
    constructor(private readonly recipientIds: string[], private readonly vatsimApi: VatsimApi, private readonly logger: Logger) {}

    supported(command: string, args: string[], message: Message): boolean {
        return !message.author.bot && command === 'check';
    }

    async handle(command: string, args: string[], message: Message): Promise<void> {
        return this.recipientIds.forEach(recipientId => {
            if (!message.guild.members.cache.has(recipientId)) {
                message.channel.send(':x: - User perms not found!');
                this.logger.error('User ran check command but did not have correct perms!');
                return;
            }
            
            const mentionedMember = message.mentions.members.first();

            this.getVATSIMUser(mentionedMember)
                .then(data => {
                    const reg_date = new Date(data['reg_date']).toUTCString();
                    const vacc = data.subdivision === 'BHR' ? 'Home (Bahrain/BHR)' : data.subdivision;

                    const id = data.id;
                    const name = `${data.name_first} ${data.name_last}`;
                    const atcRatings = ATCRatings[data.rating];
                    const pilotRating = PilotRatings[`P${data.pilotrating}`];

                    return this.sendMessageToChannel(
                        mentionedMember.nickname ? mentionedMember.nickname : mentionedMember.user.username,
                        `
                            CID: **${id} (${name})**
                            vACC: **${vacc}**
                            Reg Date: **${reg_date}**
                            Controller Rating: **${atcRatings}**
                            Pilot Rating: **${pilotRating}** 
                        `,
                        message.channel as TextChannel,
                        mentionedMember.user.avatarURL());
                    //logger.info(`Role that we checked for was in the user's role array, VATSIM data has been given!`);
                });
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

    getVATSIMUser(user: GuildMember): Promise<any> {
        return this.vatsimApi.getApiInstance()
            .then(apiInstance => {
                const cid = this.parseUserCID(user);
                return this.vatsimApi.getVATSIMUser(apiInstance, cid);
            });
    }

    // private async sendMessageToUser(header: string, message: string, user: User | PartialUser): Promise<void> {
    //     // Should we be sending the bot's avatar instead?
    //     const embeddedMessage = this.constructEmbeddedMessage(header, message, user.avatarURL());
    //     await user.send(embeddedMessage);
    // }

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
