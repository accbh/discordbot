import { Logger } from '../../../logger';
import { EventHandler } from '../models';
import { Message, User, PartialUser, GuildMember, Role } from 'discord.js';

export class RevokeRoleHandler implements EventHandler {
    constructor(private readonly roleName: string, private readonly messageId: string, private readonly emojiName: string, private readonly logger: Logger) {}

    supported(messageReaction, user): boolean {
        return messageReaction.emoji.name === this.emojiName && !user.bot && messageReaction.message.id === this.messageId;
    }

    handle(messageReaction, user): Promise<void> {
        return Promise.resolve()
            .then(() => this.extractMessageProps(messageReaction.message, user, this.roleName)) 
            .then(props => props.member.roles.remove(props.role))
            .then(() => {
                this.logger.info(`Role removed from ${user.username} (${user.id}).`);
            }, () => {
                this.logger.error(`Role ${this.roleName} does not exist in server.`);
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
