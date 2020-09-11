import { Client, ClientUser, PartialTypes } from 'discord.js';
import { Logger } from './logger';
import { Hook } from './models';

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
        return this.hooks.find(_hook => _hook === hook || (_hook.name === hook.name && _hook.listener === hook.listener));
    }

    getRunningAsUser(): ClientUser {
        // TODO - Consider throwing errors if the client isn't connected, or not logged in etc
        return this.client?.user;
    }
}
