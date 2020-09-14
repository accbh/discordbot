import { Client, ClientUser, PartialTypes, TextChannel, User, PartialUser, Message } from 'discord.js';
import { Logger } from './lib/logger';
import { Hook, ExtractedMessageProps } from './types';

export class DiscordClient {
    constructor(private readonly token: string, partials: PartialTypes[], private readonly hooks: Hook[], private readonly logger: Logger) {
        this.client = new Client({ partials });
        this.addHooks(this.hooks);
    }

    private client: Client;

    async start(): Promise<this> {
        await this.client.login(this.token);
        this.logger.verbose(`Online as ${this.getRunningAsUser()?.tag}`);
        return this;
    }

    stop(): this {
        // TODO - disconnect and clean up
        return this;
    }

    addHooks(hooks: Hook[]): this {
        hooks.forEach(this.addHook.bind(this));
        return this;
    }

    addHook(hook: Hook): this {
        const existingHook = this.getExistingHook(hook);

        if (existingHook) {
            this.logger.debug('Attempted to add a hook thats already been added, ignoring');
            return this;
        }

        this.client.on(hook.name, hook.listener);
        this.hooks.push(hook);

        return this;
    }

    removeHooks(hooks: Hook[]): this {
        hooks.forEach(this.removeHook.bind(this));
        return this;
    }

    removeHook(hook: Hook): this {
        const existingHook = this.getExistingHook(hook);

        if (!existingHook) {
            this.logger.debug('Attempted to remove a hook that isnt listed');
            return this;
        }

        this.client.off(hook.name, hook.listener);

        const index = this.hooks.indexOf(existingHook);
        this.hooks.splice(index, 1);

        return this;
    }

    private getExistingHook(hook: Hook): Hook {
        return this.hooks.find(_hook => _hook === hook || (_hook.name === hook.name && JSON.stringify(_hook.listener) === JSON.stringify(hook.listener)));
    }

    getRunningAsUser(): ClientUser {
        // TODO - Consider throwing errors if the client isn't connected, or not logged in etc
        return this.client?.user;
    }

    getTextChannel(channelId: string): TextChannel {
        return this.client.channels.cache.get(channelId) as TextChannel;
    }

    /**
     * Grabs member that reacted to a message and the role that will be assigned to them.
     * @param message Message that was reacted to.
     * @param user User that reacted.
     * @param roleName Name of the role we want to add to the user that reacted.
     */
    extractMessageProps(message: Message, user: User | PartialUser, roleName: string): ExtractedMessageProps {
        return {
            member: message.guild.member(user.id),
            role: message.guild.roles.cache.find(x => x.name === roleName)
        };
    }
}
