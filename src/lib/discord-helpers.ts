import { MessageReaction, GuildMember, User, PartialUser, TextChannel, MessageEmbed } from 'discord.js';
import { Logger } from './logger';
import { VatsimApi } from './vatsim';
import { AppError } from './errors';

export const resetMessageReaction = async function(messageReaction: MessageReaction, logger: Logger): Promise<void> {
    await messageReaction.message.reactions.removeAll()
        .catch(error => {
            logger.error(`Error removing reactions to message ${messageReaction.message.id}: ${error}`);
        });
};

export const applyReactionToMessage = async function(messageReaction: MessageReaction, emojiName: string): Promise <void> {
    await messageReaction.message.react(emojiName);
};

export const extractUserCidFromGuildMember = function(member: GuildMember): string {
    const nickname = member && (member.nickname || member.user?.username);
        if (!nickname) {
            throw new AppError(`User's VATSIM CID could not be determined.`);
        }
        
        let vatsimCid = nickname.substring(nickname.length - 7);
        if (vatsimCid.length !== 7 || !+vatsimCid) {
            throw new AppError(`User's VATSIM CID could not be determined.`);
        }

        return vatsimCid;
};

export const getVatsimUser = async function(vatsimApi: VatsimApi, cid: string): Promise<any> {
    const apiInstance = await vatsimApi.getApiInstance();
    return vatsimApi.getVatsimUser(apiInstance, cid);
};

export const constructEmbeddedMessage = function(header: string, message: string, avatarUrl: string): MessageEmbed {
    return new MessageEmbed()
        .setAuthor(header, avatarUrl)
        .setDescription(message);
};

export const sendMessageToUser = async function(header: string, message: string, user: User | PartialUser): Promise<void> {
    // Should we be sending the bot's avatar instead?
    const embeddedMessage = constructEmbeddedMessage(header, message, user.avatarURL());
    await user.send(embeddedMessage);
};

export const sendMessageToChannel = async function(header: string, message: string, channel: TextChannel, avatarUrl: string): Promise<void> {
    const embeddedMessage = constructEmbeddedMessage(header, message, avatarUrl);
    await channel.send(embeddedMessage);
};
