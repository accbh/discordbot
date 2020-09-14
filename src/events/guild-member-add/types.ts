import { GuildMember } from 'discord.js';
import { EventHandler as GenericEventHandler } from '../models';

export interface EventHandler extends GenericEventHandler {
    supported(member: GuildMember): boolean;
    handle(member: GuildMember): Promise<void>;
}
