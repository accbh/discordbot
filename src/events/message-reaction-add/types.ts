import { MessageReaction, User } from 'discord.js';

export interface EventHandler {
    supported(messageReaction: MessageReaction, user: User): boolean;
    handle(messageReaction: MessageReaction, user: User): Promise<void>;
}
