import { Hook } from '../../models';
import { Logger } from '../../logger';
import { EventHandler } from './models';

export class EventManager {
    constructor(private readonly handlers: EventHandler[], private readonly logger: Logger) {}

    getHooks(): Hook[] {
        return [{
            name: 'messageReactionRemove',
            listener: async(messageReaction, user) => {
                const handler = this.handlers.find(handler => handler.supported(messageReaction, user));

                if (!handler) {
                    this.logger.warn('Blah blah, TODO');
                    return;
                }

                await handler.handle(messageReaction, user);
            }
        }];
    }
}


