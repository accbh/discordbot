import { Message, GuildMember, TextChannel, MessageEmbed } from 'discord.js';

import { EventHandler } from '../models';
import { Logger } from '../../../lib/logger';
import { VatsimApi } from '../../../lib/vatsim';
import { ATCRatings, PilotRatings } from '../../../lib/ratings';
import { AppError } from '../../../lib/errors';

export class CheckHandler implements EventHandler {
    constructor(private readonly allowedCommandUserIds: string[], private readonly vatsimApi: VatsimApi, private readonly logger: Logger) {}

    supported(command: string, args: string[], message: Message): boolean {
        return command === 'check' && !message?.author?.bot && this.allowedCommandUserIds.includes(message.author.id);
    }

    async handle(command: string, args: string[], message: Message): Promise<void> {
        const mentionedMember = message.mentions.members.first();
        this.logger.verbose(`Checking member: ${mentionedMember.nickname}`);
        
        await Promise.resolve()
            .then(() => this.parseUserCID(mentionedMember))
            .then(cid => this.getVATSIMUser(cid))
            .then(data => {
                const reg_date = new Date(data['reg_date']).toUTCString();
                const vacc = data.subdivision === 'BHR' ? 'Home (Bahrain/BHR)' : data.subdivision || 'None';
                const division = data.division || 'None';

                const id = data.id;
                const name = `${data.name_first} ${data.name_last}`;
                const atcRatings = ATCRatings[data.rating];
                const pilotRating = PilotRatings[`P${data.pilotrating}`];

                return this.sendMessageToChannel(
                    mentionedMember.nickname ? mentionedMember.nickname : mentionedMember.user.username,
                    `
                        CID: **${id} (${name})**
                        vACC: **${vacc}**
                        Division: **${division}**
                        Reg Date: **${reg_date}**
                        Controller Rating: **${atcRatings}**
                        Pilot Rating: **${pilotRating}**
                    `,
                    message.channel as TextChannel,
                    mentionedMember.user.avatarURL());
                //logger.info(`Role that we checked for was in the user's role array, VATSIM data has been given!`);
            })
            .catch(error => {
                if (error instanceof AppError) {
                    return this.sendMessageToChannel(
                        mentionedMember.nickname ? mentionedMember.nickname : mentionedMember.user.username,
                        error.detailed,
                        message.channel as TextChannel,
                        mentionedMember.user.avatarURL()
                    );
                }

                throw error;
            });
    }

    parseUserCID(member: GuildMember): string {
        const nickname = member?.nickname || member?.user?.username;
        if (!nickname) {
            // TODO - Throw an error or add some early exit code
            throw Error('Oops');
        }
        
        let vatsimCid = nickname.substring(nickname.length - 7);
        if (vatsimCid.length !== 7 || !+vatsimCid) {
            throw new AppError(`User's VATSIM CID could not be determined.`);
        }

        return vatsimCid;
    }

    getVATSIMUser(cid: string): Promise<any> {
        return this.vatsimApi.getApiInstance()
            .then(apiInstance => this.vatsimApi.getVATSIMUser(apiInstance, cid));
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
