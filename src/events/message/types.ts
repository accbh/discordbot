import { Message } from 'discord.js';

export interface EventHandler {
    supported(command: string, args: string[], message: Message): boolean;
    handle(command: string, args: string[], message: Message): Promise<void>;
}
