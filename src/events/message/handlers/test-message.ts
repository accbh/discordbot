import { Message } from 'discord.js';

import { EventHandler } from '../models';
import { Logger } from '../../../lib/logger';

export class TestMessageHandler implements EventHandler {
    constructor(private readonly welcomeMessage: string, private readonly logger: Logger) {}

    supported(command: string, args: string[], message: Message): boolean {
        return !message.author.bot && command === 'testmessage';
    }

    async handle(command: string, args: string[], message: Message): Promise<void> {
        await message.author.send(this.welcomeMessage);
        this.logger.info(`Welcome message sent to ${message.author.username} (${message.author.id}).`);
    }
}
