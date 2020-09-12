import { Message } from 'discord.js';

import { Hook } from '../../models';
import { Logger } from '../../lib/logger';
import { EventHandler } from './models';

export class EventManager {
    constructor(private readonly handlers: EventHandler[], private readonly messagePrefix: string, private readonly allowedMembers: string[], private readonly logger: Logger) {
        // tslint:disable-next-line: tsr-detect-non-literal-regexp
        this.messagePrefixRegex = new RegExp(`^${this.messagePrefix}`, 'ig');
    }

    private messagePrefixRegex: RegExp;

    getHooks(): Hook[] {
        return [{
            name: 'message',
            listener: async(message: Message) => {
                const messagePrefixMatched = this.messagePrefixRegex.test(message.content);
                if (!messagePrefixMatched) {
                    return;
                }

                const authorIsAllowed = this.allowedMembers.includes(message.author.id);
                if (!authorIsAllowed) {
                    return;
                }
            
                const args = message.content.replace(this.messagePrefixRegex, '').trim().split(/ +/);
                const command = args.shift().toLowerCase();

                const handler = this.handlers.find(handler => handler.supported(command, args, message));

                if (!handler) {
                    this.logger.warn('Blah blah, TODO');
                    return;
                }

                await handler.handle(command, args, message);
            }
        }];
    }
}
