import { Message, User, PartialUser, GuildMember, Role, MessageReaction } from 'discord.js';
import { EventHandler } from '../models';
import { Logger } from '../../../lib/logger';

export class AssignRoleHandler implements EventHandler {
    constructor(private readonly roleName: string, private readonly messageId: string, private readonly emojiName: string, private readonly logger: Logger) {}

    supported(messageReaction: MessageReaction, user: User, a?: any, b?: any, c?: any): boolean {
        return messageReaction.emoji.name === this.emojiName && !user.bot && messageReaction.message.id === this.messageId;
    }

    handle(messageReaction: MessageReaction, user: User): Promise<void> {
        return Promise.resolve()
            .then(() => this.extractMessageProps(messageReaction.message, user, this.roleName))
            .then(props => props.member.roles.add(props.role))
            .then(() => {
                this.logger.info(`Role added to ${user.username} (${user.id})`);
            }, () => {
                this.logger.error(`Role '${this.roleName}' doesn't exist.`);
            });
    }

    /**
     * Grabs member that reacted to a message and the role that will be assigned to them.
     * @param message Message that was reacted to.
     * @param user User that reacted.
     * @param roleName Name of the role we want to add to the user that reacted.
     */
    extractMessageProps(message: Message, user: User | PartialUser, roleName: string): { member: GuildMember, role: Role } {
        return {
            member: message.guild.member(user.id),
            role: message.guild.roles.cache.find(x => x.name === roleName)
        };
    }
}
