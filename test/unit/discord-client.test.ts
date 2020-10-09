import sinon, { StubbedInstance, stubInterface, stubObject } from 'ts-sinon';
import { Channel, Client, ClientUser, GuildMember, Message, PartialTypes, Role, TextChannel, User } from 'discord.js';
import { should } from 'chai';

import { DiscordClient } from '../../src/discord-client';
import { Logger } from '../../src/lib/logger';
import { Hook } from '../../src/types';

describe('DiscordClient', () => {
    const token = 'some-token';

    let partials: PartialTypes[];
    let logger: StubbedInstance<Logger>;
    let client: DiscordClient;

    let sandbox: sinon.SinonSandbox;

    let originalClient: Client;
    let internalClient: StubbedInstance<Client>;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        partials = [];
        logger = stubInterface<Logger>();
        client = new DiscordClient(token, partials, logger);

        originalClient = (client as any).client;
        internalClient = stubObject<Client>((client as any).client);
        (client as any).client = internalClient;
    });

    afterEach(() => {
        originalClient.destroy();
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should construct an instance as expected', () => {
            Object.keys(client).should.be.deep.equal([
                'token',
                'logger',
                'hooks',
                'client'
            ]);

            (client as any).token.should.be.equal(token);
            ((client as any).logger === logger).should.be.true;
            (client as any).hooks.should.be.deep.equal([]);
            (client as any).client.should.be.equal(internalClient);
        });
    });

    describe('start', () => {
        const currentUserTag: string = 'current-user-tag';

        let currentUser: ClientUser;
        let getRunningAsUserStub: sinon.SinonStub<[], ClientUser>;

        beforeEach(() => {
            currentUser = { tag: currentUserTag } as ClientUser;
            
            getRunningAsUserStub = sandbox.stub(client, 'getRunningAsUser').returns(currentUser);
        });

        it('should reject with any error thrown by internalCient.login()', () => {
            const error = new Error('Some fake error');
            internalClient.login.rejects(error);

            return client.start()
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    internalClient.login.should.have.been.calledOnce;
                    internalClient.login.should.have.been.calledWithExactly(token);

                    getRunningAsUserStub.should.not.have.been.called;
                    logger.verbose.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should reject with any error thrown by client.getRunningAsUser()', () => {
            const error = new Error('Some fake error');
            getRunningAsUserStub.throws(error);

            return client.start()
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    internalClient.login.should.have.been.calledOnce;
                    internalClient.login.should.have.been.calledWithExactly(token);

                    getRunningAsUserStub.should.have.been.calledOnce;
                    getRunningAsUserStub.should.have.been.calledWithExactly();

                    logger.verbose.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should reject with any error thrown by logger.verbose()', () => {
            const error = new Error('Some fake error');
            logger.verbose.throws(error);

            return client.start()
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    internalClient.login.should.have.been.calledOnce;
                    internalClient.login.should.have.been.calledWithExactly(token);

                    getRunningAsUserStub.should.have.been.calledOnce;
                    getRunningAsUserStub.should.have.been.calledWithExactly();

                    logger.verbose.should.have.been.calledOnce;
                    logger.verbose.should.have.been.calledWithExactly(`Online as ${currentUserTag}`);

                    err.should.be.equal(error);
                });
        });

        it('should resolve itself after logging in and logging a verbose message where no user exists', () => {
            getRunningAsUserStub.returns(undefined);

            return client.start()
                .then(result => {
                    internalClient.login.should.have.been.calledOnce;
                    internalClient.login.should.have.been.calledWithExactly(token);

                    getRunningAsUserStub.should.have.been.calledOnce;
                    getRunningAsUserStub.should.have.been.calledWithExactly();

                    logger.verbose.should.have.been.calledOnce;
                    logger.verbose.should.have.been.calledWithExactly(`Online as undefined`);

                    result.should.be.equal(client);
                });
        });

        it('should resolve itself after logging in and logging a verbose message', () => {
            return client.start()
                .then(result => {
                    internalClient.login.should.have.been.calledOnce;
                    internalClient.login.should.have.been.calledWithExactly(token);

                    getRunningAsUserStub.should.have.been.calledOnce;
                    getRunningAsUserStub.should.have.been.calledWithExactly();

                    logger.verbose.should.have.been.calledOnce;
                    logger.verbose.should.have.been.calledWithExactly(`Online as ${currentUserTag}`);

                    result.should.be.equal(client);
                });
        });
    });

    describe('stop', () => {
        it('should reject with any error thrown by internalClient.destroy()', () => {
            const error = new Error('Some fake error');
            internalClient.destroy.throws(error);

            return client.stop()
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    internalClient.destroy.should.have.been.calledOnce;
                    internalClient.destroy.should.have.been.calledWithExactly();

                    err.should.be.equal(error);
                });
        });

        it('should resolve itself after resetting the instance', () => {
            return client.stop()
                .then(result => {
                    internalClient.destroy.should.have.been.calledOnce;
                    internalClient.destroy.should.have.been.calledWithExactly();

                    (client as any).hooks.should.be.deep.equal([]);

                    result.should.be.equal(client);
                });
        });
    });

    describe('addHooks', () => {
        let addHookStub: sinon.SinonStub<[Hook], DiscordClient>;

        beforeEach(() => {
            addHookStub = sandbox.stub(client, 'addHook').returns(client);
        });

        it('should return itself after doing nothing when no hooks were supplied', () => {
            const hooks = [];

            const result = client.addHooks(hooks);

            addHookStub.should.not.have.been.called;
            result.should.be.equal(client);
        });

        it('should thrown any error thrown by client.addHook()', () => {
            const hook = stubInterface<Hook>();
            const hooks = [hook];

            const error = new Error('Some fake error');
            addHookStub.throws(error);

            return Promise.resolve()
                .then(() => client.addHooks(hooks))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    addHookStub.should.have.been.calledOnce;
                    addHookStub.should.have.been.calledWithExactly(hook);
                    
                    err.should.be.equal(error);
                });
        });

        it('should return itself after invoking client.addHook() for each hook provided', () => {
            const hookA = stubInterface<Hook>();
            const hookB = stubInterface<Hook>();
            const hookC = stubInterface<Hook>();

            const hooks = [hookA, hookB, hookC];

            return Promise.resolve()
                .then(() => client.addHooks(hooks))
                .then(result => {
                    addHookStub.should.have.been.calledThrice;
                    addHookStub.firstCall.should.have.been.calledWithExactly(hookA);
                    addHookStub.secondCall.should.have.been.calledWithExactly(hookB);
                    addHookStub.thirdCall.should.have.been.calledWithExactly(hookC);
                    
                    result.should.be.equal(client);
                });
        });
    });

    describe('addHook', () => {
        const hookName = 'message';
        let hookListener: sinon.SinonStub<[], void>;

        let hook: Hook;

        beforeEach(() => {
            hookListener = sandbox.stub();
            hook = { name: hookName, listener: hookListener};

            (client as any).hooks.should.be.deep.equal([]);
        });

        it('should return itself without doing anything if the hook is already added', () => {
            (client as any).hooks.push(hook);
            (client as any).hooks.should.be.deep.equal([hook]);

            return Promise.resolve()
                .then(() => client.addHook(hook))
                .then(result => {
                    logger.debug.should.have.been.calledOnce;
                    logger.debug.should.have.been.calledWithExactly('Attempted to add a hook thats already been added, ignoring');

                    internalClient.on.should.not.have.been.called;
                    (client as any).hooks.should.be.deep.equal([hook]);

                    hookListener.should.not.have.been.called;

                    result.should.be.equal(client);
                });
        });

        it('should throw any error thrown by internalClient.on when the hook has not been added previously', () => {
            const error = new Error();
            internalClient.on.throws(error);

            return Promise.resolve()
                .then(() => client.addHook(hook))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    logger.debug.should.not.have.been.called;

                    internalClient.on.should.have.been.calledOnce;
                    internalClient.on.should.have.been.calledWithExactly(hookName, hookListener);

                    (client as any).hooks.should.be.deep.equal([]);

                    hookListener.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it(`should return itself after successfully adding a hook that wasn't added previously`, () => {
            return Promise.resolve()
                .then(() => client.addHook(hook))
                .then(result => {
                    logger.debug.should.not.have.been.called;

                    internalClient.on.should.have.been.calledOnce;
                    internalClient.on.should.have.been.calledWithExactly(hookName, hookListener);

                    (client as any).hooks.should.be.deep.equal([hook]);

                    hookListener.should.not.have.been.called;

                    result.should.be.equal(client);
                });
        });
    });

    describe('removeHooks', () => {
        let removeHookStub: sinon.SinonStub<[Hook], DiscordClient>;

        beforeEach(() => {
            removeHookStub = sandbox.stub(client, 'removeHook').returns(client);
        });

        it('should return itself after doing nothing when no hooks were supplied', () => {
            const hooks = [];

            const result = client.removeHooks(hooks);

            removeHookStub.should.not.have.been.called;
            result.should.be.equal(client);
        });

        it('should thrown any error thrown by client.addHook()', () => {
            const hook = stubInterface<Hook>();
            const hooks = [hook];

            const error = new Error('Some fake error');
            removeHookStub.throws(error);

            return Promise.resolve()
                .then(() => client.removeHooks(hooks))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    removeHookStub.should.have.been.calledOnce;
                    removeHookStub.should.have.been.calledWithExactly(hook);
                    
                    err.should.be.equal(error);
                });
        });

        it('should return itself after invoking client.addHook() for each hook provided', () => {
            const hookA = stubInterface<Hook>();
            const hookB = stubInterface<Hook>();
            const hookC = stubInterface<Hook>();

            const hooks = [hookA, hookB, hookC];

            return Promise.resolve()
                .then(() => client.removeHooks(hooks))
                .then(result => {
                    removeHookStub.should.have.been.calledThrice;
                    removeHookStub.firstCall.should.have.been.calledWithExactly(hookA);
                    removeHookStub.secondCall.should.have.been.calledWithExactly(hookB);
                    removeHookStub.thirdCall.should.have.been.calledWithExactly(hookC);
                    
                    result.should.be.equal(client);
                });
        });
    });

    describe('removeHook', () => {
        const hookName = 'message';
        let hookListener: sinon.SinonStub<[], void>;

        let hook: Hook;

        beforeEach(() => {
            hookListener = sandbox.stub();
            hook = { name: hookName, listener: hookListener};
            
            (client as any).hooks.push(hook);
            (client as any).hooks.should.be.deep.equal([hook]);
        });

        it('should return itself without doing anything if the hook isnt already added', () => {
            (client as any).hooks = [];
            (client as any).hooks.should.be.deep.equal([]);

            return Promise.resolve()
                .then(() => client.removeHook(hook))
                .then(result => {
                    logger.debug.should.have.been.calledOnce;
                    logger.debug.should.have.been.calledWithExactly('Attempted to remove a hook that isnt listed');

                    internalClient.off.should.not.have.been.called;
                    (client as any).hooks.should.be.deep.equal([]);

                    hookListener.should.not.have.been.called;

                    result.should.be.equal(client);
                });
        });

        it('should throw any error thrown by internalClient.off when the hook has not been added previously', () => {
            const error = new Error();
            internalClient.off.throws(error);

            return Promise.resolve()
                .then(() => client.removeHook(hook))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    logger.debug.should.not.have.been.called;

                    internalClient.off.should.have.been.calledOnce;
                    internalClient.off.should.have.been.calledWithExactly(hookName, hookListener);

                    (client as any).hooks.should.be.deep.equal([hook]);

                    hookListener.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should return itself after successfully removing a hook that was added previously', () => {
            return Promise.resolve()
                .then(() => client.removeHook(hook))
                .then(result => {
                    logger.debug.should.not.have.been.called;

                    internalClient.off.should.have.been.calledOnce;
                    internalClient.off.should.have.been.calledWithExactly(hookName, hookListener);

                    (client as any).hooks.should.be.deep.equal([]);

                    hookListener.should.not.have.been.called;

                    result.should.be.equal(client);
                });
        });
    });

    describe('getRunningUser', () => {
        it('should return undefined if no client exists', () => {
            delete (client as any).client;

            const result = client.getRunningAsUser();
            should().not.exist(result);
        });

        it('should return undefined if client.user is undefined', () => {
            (client as any).client.user = undefined;

            const result = client.getRunningAsUser();
            should().not.exist(result);
        });

        it('should return the client.user', () => {
            const user = {} as ClientUser;
            (client as any).client.user = user;

            const result = client.getRunningAsUser();
            result.should.be.equal(user);
        });
    });

    describe('getTextChannel', () => {
        const channelId = 'some-channel-id';

        let channelsCacheGetStub: sinon.SinonStub<[string], Channel>;

        beforeEach(() => {
            channelsCacheGetStub = sandbox.stub(internalClient.channels.cache, 'get');
        });

        it('should throw any error thrown by internalClient.channels.cache.get()', () => {
            const error = new Error('Some fake error');
            channelsCacheGetStub.throws(error);

            return Promise.resolve()
                .then(() => client.getTextChannel(channelId))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    channelsCacheGetStub.should.have.been.calledOnce;
                    channelsCacheGetStub.should.have.been.calledWithExactly(channelId);

                    err.should.be.equal(error);
                });
        });

        it('should return undefined as returned by internalClient.channels.cache.get()', () => {
            const channel = undefined;
            channelsCacheGetStub.returns(channel);

            const result = client.getTextChannel(channelId);

            channelsCacheGetStub.should.have.been.calledOnce;
            channelsCacheGetStub.should.have.been.calledWithExactly(channelId);

            should().not.exist(result);
        });

        it('should return the channel as returned by internalClient.channels.cache.get()', () => {
            const channel = stubInterface<TextChannel>();
            channelsCacheGetStub.returns(channel);

            const result = client.getTextChannel(channelId);

            channelsCacheGetStub.should.have.been.calledOnce;
            channelsCacheGetStub.should.have.been.calledWithExactly(channelId);

            (result === channel).should.be.true;
        });
    });

    describe('extractMessageProps', () => {
        it('should return an object as expected', () => {
            const userId = 'some-user-id';
            const roleName = 'some-role-name';
            
            const member: GuildMember = {} as GuildMember;
            const role: Role = { name: roleName } as Role;
            const message: Message = {
                guild: {
                    member: sandbox.stub().returns(member),
                    roles: {
                        cache: [role]
                    }
                }
            } as any as Message;
            const user: User = { id: userId } as User;
            const result = client.extractMessageProps(message, user, roleName);
            message.guild.member.should.have.been.calledOnce;
            message.guild.member.should.have.been.calledWithExactly(userId);
            result.should.be.deep.equal({ member, role });
        });
    });
});
