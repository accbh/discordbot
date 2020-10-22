import { User, MessageReaction, PartialUser } from 'discord.js';

import { EventHandler } from '../types';

export class CancelTrainingRequestHandler implements EventHandler {
    constructor(
        private readonly messageId: string,
        private readonly emojiName: string
    ) { }

    supported(messageReaction: MessageReaction, user: User | PartialUser): boolean {
        return messageReaction.emoji.name === this.emojiName && messageReaction.message.id === this.messageId;
    }

    async handle(messageReaction: MessageReaction, user: User): Promise<void> {
        // When a user requests training using the reaction of an emoji on the requestTraining message,
        // the code will automatically remove the reaction, and this function will be invoked..
        // Theres nothing for us to do, this just helps prevent the logger from warning us that we have no
        // handler to handle this event
    }
}
