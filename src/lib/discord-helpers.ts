import { MessageReaction, GuildMember, User, PartialUser, TextChannel, MessageEmbed } from 'discord.js';
import { VatsimApi } from './vatsim';
import { AppError } from './errors';
import { factory } from './helpers';

export const resetMessageReaction = async (messageReaction: MessageReaction): Promise<void> => {
    await messageReaction.message.reactions.removeAll();
};

export const applyReactionToMessage = async (messageReaction: MessageReaction, emojiName: string): Promise<void> => {
    await messageReaction.message.react(emojiName);
};

export const extractUserCidFromGuildMember = (member: GuildMember): string => {
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

export const getVatsimUser = async (vatsimApi: VatsimApi, cid: string): Promise<any> => {
    const apiInstance = await vatsimApi.getApiInstance();
    return vatsimApi.getVatsimUser(apiInstance, cid);
};

export const constructEmbeddedMessage = (header: string, message: string, avatarUrl: string): MessageEmbed => {
    return new MessageEmbed()
        .setAuthor(header, avatarUrl)
        .setDescription(message);
};

export const sendMessageToUser = async (header: string, message: string, user: User | PartialUser): Promise<void> => {
    // Should we be sending the bot's avatar instead?
    const embeddedMessage = constructEmbeddedMessage(header, message, user.avatarURL());
    await user.send(embeddedMessage);
};

export const sendMessageToChannel = async (header: string, message: string, channel: TextChannel, avatarUrl: string): Promise<void> => {
    const embeddedMessage = constructEmbeddedMessage(header, message, avatarUrl);
    await channel.send(embeddedMessage);
};

export const removeUserFromMessageReaction = async (messageReaction: MessageReaction, user: User): Promise<void> => {
    await factory.defaultRetry<MessageReaction>(() => messageReaction.users.remove(user));
};
