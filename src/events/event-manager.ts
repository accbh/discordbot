import { ClientEvents } from 'discord.js';

import { Hook } from '../models';
import { Logger } from '../lib/logger';
import { EventHandler } from './models';

export class EventManager {
    constructor(private hookName: keyof ClientEvents, private readonly handlers: EventHandler[], private readonly logger: Logger) {}

    getHooks(): Hook[] {
        return [{
            name: this.hookName,
            listener: async(...args: any[]) => {
                const handler = this.handlers.find(handler => handler.supported(args));

                if (!handler) {
                    this.logger.warn('Blah blah, TODO');
                    return;
                }

                await handler.handle(args);
            }
        }];
    }
}
