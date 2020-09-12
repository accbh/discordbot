import minimist from 'minimist';

export class Config {
    help: boolean = false;

    name?: string;
    versionedName?: string;

    loglevel?: string;

    discordToken?: string;

    botCommandPrefix?: string;
    developerIds?: string[];

    newMemberWelcomeMessage?: string;

    notificationsRoleMessageId?: string;
    notificationsRoleName?: string;

    requestTrainingMessageId?: string;
    trainingRequestChannelId?: string;
    calendarUrl?: string;
    
    static fromArgs(argv: string[], pkg: any): Config {
        const args: string[] = minimist(argv.slice(2), { string: ['alias'] });
        const config = new Config();

        config.help = args.hasOwnProperty('help');

        config.name = pkg.name;
        config.versionedName = `${config.name}@${pkg.version}`;
        
        config.loglevel = Config.param(args, 'loglevel', 'info');

        config.discordToken = Config.param(args, 'discord-token');

        config.botCommandPrefix = Config.param(args, 'bot-command-prefix', '¬');
        config.developerIds = Config.param(args, 'developer-ids', '').split(',').map(developerId => developerId.trim());

        config.newMemberWelcomeMessage = Config.param(args, 'new-member-welcome-message', 'Welcome to the Bahrain vAcc discord server');

        config.notificationsRoleMessageId = Config.param(args, 'notifications-role-message-id');
        config.notificationsRoleName = Config.param(args, 'notifications-role-name', 'Notifications');

        config.requestTrainingMessageId = Config.param(args, 'request-training-message-id');
        config.trainingRequestChannelId = Config.param(args, 'traning-request-channel-id');
        config.calendarUrl = Config.param(args, 'calendar-url', 'https://www.google.com/calendar/render?action=TEMPLATE&text=Bahrain+vACC+Training&details=Training+Session+-+Generated+by+Jarvis&dates=');

        return config;
    }

    static param(args: string[], name: string, def: any = null): string {
        const result = args[name] || process.env[name.toUpperCase()] || def;
        if ([undefined, null].includes(result)) {
            return;
        }
        return result.toString();
    }

    static isTrue(value: any): boolean {
        return /^(true|1)$/i.test(value) || value === 1 || value === true;
    }

    static getHelp(): string {
        return `
        The following command line arguments are available:

            --loglevel=<string>{info}                                   Options are info|debug|info|error
            
            --discord-token=<string>                                    The issued token to be used for authentication with Discord

            --bot-command-prefix=<string>{¬}                            The prefix to check for when a message is received before firing off any bot command handlers
            --developer-ids=<string[]>{[]}                              The list of ids of members who have developer permissions

            --new-member-welcome-message=<string>                       The message to send to the a user who joins
            
            --notifications-role-message-id=<string>                    The id of the message to watch, a reaction will assign the --notifications-role-name to the new member
            --notifications-role-name=<string>{Notifications}           The name of the role to assign to a user that wants to receive notifications

            --request-training-message-id=<string>                      The id of the message to watch, a reaction will begin a conversation with the user requesting information about when s/he wants training, and then put the request in the --training-request-channel-id channel
            --training-request-channel-id=<string>                      The id of the channel where requests for training will be published
            --calendar-url=<string>                                     The url to use when a training request message is sent to the mentors

        `;
    }
}
