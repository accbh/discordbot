import { User, MessageReaction } from 'discord.js';
import { EventHandler } from '../types';
import { Logger } from '../../../lib/logger';
import { ExtractedMessagePropsFn } from '../../../types';

export class AssignRoleHandler implements EventHandler {
    constructor(
        private readonly roleName: string,
        private readonly messageId: string,
        private readonly emojiName: string,
        private readonly extractMessageProps: ExtractedMessagePropsFn,
        private readonly logger: Logger
    ) {}

    supported(messageReaction: MessageReaction, user: User): boolean {
        return messageReaction.emoji.name === this.emojiName && !user.bot && messageReaction.message.id === this.messageId;
    }

    handle(messageReaction: MessageReaction, user: User): Promise<void> {
        return Promise.resolve()
            .then(() => this.extractMessageProps(messageReaction.message, user, this.roleName))
            .then(props => props.member.roles.add(props.role))
            .then(() => {
                this.logger.info(`Role added to ${user.username} (${user.id})`);
            }, err => {
                this.logger.error(`Role '${this.roleName}' doesn't exist.`);
                throw err;
            });
    }
}
