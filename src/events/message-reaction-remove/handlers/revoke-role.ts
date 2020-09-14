import { User, MessageReaction } from 'discord.js';

import { ExtractedMessagePropsFn } from '../../../types';
import { Logger } from '../../../lib/logger';
import { EventHandler } from '../types';

export class RevokeRoleHandler implements EventHandler {
    constructor(private readonly roleName: string, private readonly messageId: string, private readonly emojiName: string, private readonly extractMessageProps: ExtractedMessagePropsFn, private readonly logger: Logger) {}

    supported(messageReaction: MessageReaction, user: User): boolean {
        return messageReaction.emoji.name === this.emojiName && !user.bot && messageReaction.message.id === this.messageId;
    }

    handle(messageReaction: MessageReaction, user: User): Promise<void> {
        return Promise.resolve()
            .then(() => this.extractMessageProps(messageReaction.message, user, this.roleName)) 
            .then(({ member, role }) => member.roles.remove(role))
            .then(() => {
                this.logger.info(`Role removed from ${user.username} (${user.id}).`);
            }, error => {
                this.logger.error(`Role ${this.roleName} does not exist in server.`);
                throw error;
            });
    }
}
