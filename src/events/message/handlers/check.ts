import { Message, TextChannel } from 'discord.js';

import { EventHandler } from '../types';
import { Logger } from '../../../lib/logger';
import { VatsimApi } from '../../../lib/vatsim';
import { ATCRatings, PilotRatings } from '../../../types';
import { AppError } from '../../../lib/errors';
import { extractUserCidFromGuildMember, getVatsimUser, sendMessageToChannel } from '../../../lib/discord-helpers';

export class CheckHandler implements EventHandler {
    constructor(private readonly allowedCommandUserIds: string[], private readonly vatsimApi: VatsimApi, private readonly logger: Logger) {}

    supported(command: string, args: string[], message: Message): boolean {
        return command === 'check' && !message?.author?.bot && this.allowedCommandUserIds.includes(message.author.id);
    }

    async handle(command: string, args: string[], message: Message): Promise<void> {
        const mentionedMember = message.mentions.members.first();
        this.logger.verbose(`Checking member: ${mentionedMember.nickname}`);
        
        await Promise.resolve()
            .then(() => extractUserCidFromGuildMember(mentionedMember))
            .then(cid => getVatsimUser(this.vatsimApi, cid))
            .then(data => {
                const reg_date = new Date(data['reg_date']).toUTCString();
                const vacc = data.subdivision === 'BHR' ? 'Home (Bahrain/BHR)' : data.subdivision || 'None';
                const division = data.division || 'None';

                const id = data.id;
                const name = `${data.name_first} ${data.name_last}`;
                const atcRatings = ATCRatings[data.rating];
                const pilotRating = PilotRatings[`P${data.pilotrating}`];

                return sendMessageToChannel(
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
                    return sendMessageToChannel(
                        mentionedMember.nickname ? mentionedMember.nickname : mentionedMember.user.username,
                        error.detailed,
                        message.channel as TextChannel,
                        mentionedMember.user.avatarURL()
                    );
                }

                throw error;
            });
    }
}
