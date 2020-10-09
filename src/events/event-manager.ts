import Bluebird from 'bluebird';
import { ClientEvents } from 'discord.js';

import { Hook } from '../types';
import { Logger } from '../lib/logger';
import { EventHandler } from './types';

export class EventManager {
    constructor(private hookName: keyof ClientEvents, private readonly handlers: EventHandler[], private readonly logger: Logger) {}

    getHooks(): Hook[] {
        return [{
            name: this.hookName,
            listener: async(...args: any[]) => {
                const handlers = this.handlers.filter(handler => handler.supported.call(handler, ...args));

                if (!handlers.length) {
                    this.logger.warn(`No handlers found able to handle hook '${this.hookName}' with args: ${JSON.stringify(args)}`);
                    return;
                }
                
                await Bluebird.map(handlers, handler => handler.handle.call(handler, ...args), { concurrency: 5 })
                    .catch(error => this.logger.error(error.detailed || error.message));
            }
        }];
    }
}
