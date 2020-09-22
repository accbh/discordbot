import Bluebird from 'bluebird';
import { Message } from 'discord.js';

import { Hook } from '../../types';
import { Logger } from '../../lib/logger';
import { EventHandler } from './types';

export class EventManager {
    constructor(private readonly handlers: EventHandler[], private readonly messagePrefix: string, private readonly logger: Logger) {
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

                const args = message.content.replace(this.messagePrefixRegex, '').trim().split(/ +/);
                const command = args.shift().toLowerCase();

                const handlers = this.handlers.filter(handler => handler.supported(command, args, message));

                if (!handlers.length) {
                    this.logger.warn(`No handlers found able to handle command '${command}'`);
                    return;
                }

                await Bluebird.map(handlers, handler => handler.handle(command, args, message), { concurrency: 5 })
                    .catch(error => this.logger.error(error.detailed || error.message));
            }
        }];
    }
}
