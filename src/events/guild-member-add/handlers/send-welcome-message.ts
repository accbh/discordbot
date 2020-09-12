import { GuildMember } from 'discord.js';

import { EventHandler } from '../models';
import { Logger } from '../../../lib/logger';

export class SendWelcomeMessageHandler implements EventHandler {
    constructor(private readonly welcomeMessage: string, private readonly logger: Logger) {}

    supported(member: GuildMember): boolean {
        return !member.user.bot;
    }

    async handle(member: GuildMember): Promise<void> {
        await member.send(this.welcomeMessage);
        this.logger.info(`${member} has joined! The welcome info was sent.`);
    }
}
