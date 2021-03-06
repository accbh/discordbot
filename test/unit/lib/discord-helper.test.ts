import * as discordHelpers from '../../../src/lib/discord-helpers';

import sinon, { stubInterface, StubbedInstance } from 'ts-sinon';

import { MessageReaction, GuildMember, MessageEmbed, User, TextChannel, UserResolvable } from 'discord.js';
import { should } from 'chai';
import { AxiosInstance } from 'axios';

import { resetMessageReaction, applyReactionToMessage, extractUserCidFromGuildMember, getVatsimUser, constructEmbeddedMessage, sendMessageToUser, sendMessageToChannel, removeUserFromMessageReaction } from '../../../src/lib/discord-helpers';
import { factory } from '../../../src/lib/helpers';
import { AppError } from '../../../src/lib/errors';
import { VatsimApi } from '../../../src/lib/vatsim';

describe('DiscordHelpers', () => {
    let sandbox: sinon.SinonSandbox;

    let fakeDefaultRetry: (func: () => any | Promise<any>) => Promise<any>;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        fakeDefaultRetry = async (func: () => any | Promise<any>): Promise<any> => {
            return await func();
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('resetMessageReaction', () => {
        let messageReaction: MessageReaction;

        let removeAllReactionsStub: sinon.SinonStub<[], Promise<void>>;
        let defaultRetryStub: sinon.SinonStub<[() => any | Promise<any>], Promise<any>>;

        beforeEach(() => {
            removeAllReactionsStub = sandbox.stub<[], Promise<void>>();

            messageReaction = {
                message: {
                    reactions: {
                        removeAll: removeAllReactionsStub
                    }
                }
            } as any as MessageReaction;

            defaultRetryStub = sandbox.stub(factory, 'defaultRetry').callsFake(fakeDefaultRetry);
        });

        it('should reject with any error thrown by messageReaction.message.reactions.removeAll()', () => {
            // Not sure why we are consuming this error, but i suggest we introduce Bluebird to retry this many times, before throwing the error

            const error = new Error('Some fake error');
            removeAllReactionsStub.rejects(error);

            return resetMessageReaction(messageReaction)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    removeAllReactionsStub.should.have.been.calledOnce;
                    removeAllReactionsStub.should.have.been.calledWithExactly();

                    err.should.be.equal(error);
                });
        });

        it('should resolve void after successfully removing all reactions', () => {
            removeAllReactionsStub.resolves();

            return resetMessageReaction(messageReaction)
                .then(result => {
                    defaultRetryStub.should.have.been.calledOnce;

                    removeAllReactionsStub.should.have.been.calledOnce;
                    removeAllReactionsStub.should.have.been.calledWithExactly();

                    should().not.exist(result);
                });
        });
    });

    describe('applyReactionToMessage', () => {
        const emojiName = 'some-emoji-name';
        let messageReaction: MessageReaction;

        let reactStub: sinon.SinonStub<[string], Promise<void>>;
        let defaultRetryStub: sinon.SinonStub<[() => any | Promise<any>], Promise<any>>;

        beforeEach(() => {
            reactStub = sandbox.stub();

            messageReaction = {
                message: {
                    react: reactStub
                }
            } as any as MessageReaction;

            defaultRetryStub = sandbox.stub(factory, 'defaultRetry').callsFake(fakeDefaultRetry);
        });

        it('should reject with any error thrown by messageReaction.message.react()', () => {
            const error = new Error('Some fake error');
            reactStub.rejects(error);

            return applyReactionToMessage(messageReaction, emojiName)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    reactStub.should.have.been.calledOnce;
                    reactStub.should.have.been.calledWithExactly(emojiName);

                    err.should.be.equal(error);
                });
        });

        it('should resolve void after applying the reaction to the message', () => {
            return applyReactionToMessage(messageReaction, emojiName)
                .then(result => {
                    defaultRetryStub.should.have.been.calledOnce;

                    reactStub.should.have.been.calledOnce;
                    reactStub.should.have.been.calledWithExactly(emojiName);

                    should().not.exist(result);
                });
        });
    });

    describe('extractUserCidFromGuildMember', () => {
        let member: GuildMember;

        describe(`using the member's nickname`, () => {
            const cid = '1234567';
            const nickname = `Joe Soap - ${cid}`;

            beforeEach(() => {
                member = {
                    nickname,
                    user: {
                        username: undefined
                    }
                } as GuildMember;
            });

            it('should reject an AppError when the nickname is falsey', () => {
                member.nickname = undefined;

                return Promise.resolve()
                    .then(() => extractUserCidFromGuildMember(member))
                    .then(() => {
                        throw new Error('Expected an error to be thrown but got success');
                    }, err => {
                        err.should.be.an.instanceOf(AppError);
                        err.detailed.should.be.equal(`User's VATSIM CID could not be determined.`);
                    });
            });

            it('should reject an AppError when the nickname does not end with a 7 digit vatsim cid', () => {
                member.nickname = 'No cid here';

                return Promise.resolve()
                    .then(() => extractUserCidFromGuildMember(member))
                    .then(() => {
                        throw new Error('Expected an error to be thrown but got success');
                    }, err => {
                        err.should.be.an.instanceOf(AppError);
                        err.detailed.should.be.equal(`User's VATSIM CID could not be determined.`);
                    });
            });

            it('should resolve the 7 digit vatsim cid', () => {
                return Promise.resolve()
                    .then(() => extractUserCidFromGuildMember(member))
                    .then(result => {
                        result.should.be.equal(cid);
                    });
            });
        });

        describe(`using the member.user's username`, () => {
            const cid = '1234567';
            const username = `Joe Soap - ${cid}`;

            beforeEach(() => {
                member = {
                    nickname: undefined,
                    user: {
                        username
                    }
                } as GuildMember;
            });

            it('should reject an AppError when the user is falsey', () => {
                member.user = undefined;

                return Promise.resolve()
                    .then(() => extractUserCidFromGuildMember(member))
                    .then(() => {
                        throw new Error('Expected an error to be thrown but got success');
                    }, err => {
                        err.should.be.an.instanceOf(AppError);
                        err.detailed.should.be.equal(`User's VATSIM CID could not be determined.`);
                    });
            });

            it('should reject an AppError when the username is falsey', () => {
                member.user.username = undefined;

                return Promise.resolve()
                    .then(() => extractUserCidFromGuildMember(member))
                    .then(() => {
                        throw new Error('Expected an error to be thrown but got success');
                    }, err => {
                        err.should.be.an.instanceOf(AppError);
                        err.detailed.should.be.equal(`User's VATSIM CID could not be determined.`);
                    });
            });

            it('should reject an AppError when the username does not end with a 7 digit vatsim cid', () => {
                member.user.username = 'No cid here';

                return Promise.resolve()
                    .then(() => extractUserCidFromGuildMember(member))
                    .then(() => {
                        throw new Error('Expected an error to be thrown but got success');
                    }, err => {
                        err.should.be.an.instanceOf(AppError);
                        err.detailed.should.be.equal(`User's VATSIM CID could not be determined.`);
                    });
            });

            it('should resolve the 7 digit vatsim cid', () => {
                return Promise.resolve()
                    .then(() => extractUserCidFromGuildMember(member))
                    .then(result => {
                        result.should.be.equal(cid);
                    });
            });
        });
    });

    describe('getVATSIMUser', () => {
        const cid = '1234567';

        let vatsimApi: StubbedInstance<VatsimApi>;
        let apiInstance: StubbedInstance<AxiosInstance>;

        let defaultRetryStub: sinon.SinonStub<[() => any | Promise<any>], Promise<any>>;

        beforeEach(() => {
            vatsimApi = stubInterface<VatsimApi>();
            apiInstance = stubInterface<AxiosInstance>();

            vatsimApi.getApiInstance.resolves(apiInstance);

            defaultRetryStub = sandbox.stub(factory, 'defaultRetry').callsFake(fakeDefaultRetry);
        });

        it('should reject with any error thrown by vatsimApi.getApiInstance()', () => {
            const error = new Error('Some fake error');
            vatsimApi.getApiInstance.rejects(error);

            return getVatsimUser(vatsimApi, cid)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    vatsimApi.getApiInstance.should.have.been.calledOnce;
                    vatsimApi.getApiInstance.should.have.been.calledWithExactly();

                    vatsimApi.getVatsimUser.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should reject with any error thrown by vatsimApi.getVatsimUser()', () => {
            const error = new Error('Some fake error');
            vatsimApi.getVatsimUser.rejects(error);

            return getVatsimUser(vatsimApi, cid)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    vatsimApi.getApiInstance.should.have.been.calledOnce;
                    vatsimApi.getApiInstance.should.have.been.calledWithExactly();

                    vatsimApi.getVatsimUser.should.have.been.calledOnce;
                    vatsimApi.getVatsimUser.should.have.been.calledWithExactly(apiInstance, cid);

                    err.should.be.equal(error);
                });
        });

        it('should resolve the user as resolved by vatsimApi.getVatsimUser()', () => {
            const user = {};
            vatsimApi.getVatsimUser.resolves(user);

            return getVatsimUser(vatsimApi, cid)
                .then(result => {
                    defaultRetryStub.should.have.been.calledOnce;

                    vatsimApi.getApiInstance.should.have.been.calledOnce;
                    vatsimApi.getApiInstance.should.have.been.calledWithExactly();

                    vatsimApi.getVatsimUser.should.have.been.calledOnce;
                    vatsimApi.getVatsimUser.should.have.been.calledWithExactly(apiInstance, cid);

                    result.should.be.equal(user);
                });
        });
    });

    describe('constructEmbeddedMessage', () => {
        const header = 'some header';
        const message = 'some message';
        const avatarUrl = 'https://some-avatar-url';

        it('should return an embedded message as expected', () => {
            const result = constructEmbeddedMessage(header, message, avatarUrl);
            result.should.be.an.instanceOf(MessageEmbed);
            result.author.should.be.deep.equal({ name: header, iconURL: avatarUrl, url: undefined });
            result.description.should.be.equal(message);
        });
    });

    describe('sendMessageToUser', () => {
        const header = 'some header';
        const message = 'some message';
        const avatarUrl = 'some-avatar-url';

        let user: StubbedInstance<User>;

        let embeddedMessage: StubbedInstance<MessageEmbed>;
        let constructEmbeddedMessageStub: sinon.SinonStub<[string, string, string], MessageEmbed>;

        let defaultRetryStub: sinon.SinonStub<[() => any | Promise<any>], Promise<any>>;

        beforeEach(() => {
            user = stubInterface<User>();
            user.avatarURL.returns(avatarUrl);

            embeddedMessage = stubInterface<MessageEmbed>();

            constructEmbeddedMessageStub = sandbox.stub(discordHelpers, 'constructEmbeddedMessage').returns(embeddedMessage);

            defaultRetryStub = sandbox.stub(factory, 'defaultRetry').callsFake(fakeDefaultRetry);
        });

        it('should reject with any error thrown by user.avatarUrl()', () => {
            const error = new Error('Some fake error');
            user.avatarURL.throws(error);

            return sendMessageToUser(header, message, user)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    user.avatarURL.should.have.been.calledOnce;
                    user.avatarURL.should.have.been.calledWithExactly();

                    constructEmbeddedMessageStub.should.not.have.been.called;
                    user.send.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should reject with any error thrown by constructEmbeddedMessage()', () => {
            const error = new Error('Some fake error');
            constructEmbeddedMessageStub.throws(error);

            return sendMessageToUser(header, message, user)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    user.avatarURL.should.have.been.calledOnce;
                    user.avatarURL.should.have.been.calledWithExactly();

                    constructEmbeddedMessageStub.should.have.been.calledOnce;
                    constructEmbeddedMessageStub.should.have.been.calledWithExactly(header, message, avatarUrl);

                    user.send.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should reject with any error thrown by user.send()', () => {
            const error = new Error('Some fake error');
            user.send.throws(error);

            return sendMessageToUser(header, message, user)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    user.avatarURL.should.have.been.calledOnce;
                    user.avatarURL.should.have.been.calledWithExactly();

                    constructEmbeddedMessageStub.should.have.been.calledOnce;
                    constructEmbeddedMessageStub.should.have.been.calledWithExactly(header, message, avatarUrl);

                    user.send.should.have.been.calledOnce;
                    user.send.should.have.been.calledWithExactly(embeddedMessage);

                    err.should.be.equal(error);
                });
        });

        it('should resolve void after executing as expected', () => {
            return sendMessageToUser(header, message, user)
                .then(result => {
                    defaultRetryStub.should.have.been.calledOnce;

                    user.avatarURL.should.have.been.calledOnce;
                    user.avatarURL.should.have.been.calledWithExactly();

                    constructEmbeddedMessageStub.should.have.been.calledOnce;
                    constructEmbeddedMessageStub.should.have.been.calledWithExactly(header, message, avatarUrl);

                    user.send.should.have.been.calledOnce;
                    user.send.should.have.been.calledWithExactly(embeddedMessage);

                    should().not.exist(result);
                });
        });
    });

    describe('sendMessageToChannel', () => {
        const header = 'some header';
        const message = 'some message';
        const avatarUrl = 'some-avatar-url';

        let channel: StubbedInstance<TextChannel>;

        let embeddedMessage: StubbedInstance<MessageEmbed>;
        let constructEmbeddedMessageStub: sinon.SinonStub<[string, string, string], MessageEmbed>;

        let defaultRetryStub: sinon.SinonStub<[() => any | Promise<any>], Promise<any>>;

        beforeEach(() => {
            channel = stubInterface<TextChannel>();

            embeddedMessage = stubInterface<MessageEmbed>();
            constructEmbeddedMessageStub = sandbox.stub(discordHelpers, 'constructEmbeddedMessage').returns(embeddedMessage);

            defaultRetryStub = sandbox.stub(factory, 'defaultRetry').callsFake(fakeDefaultRetry);
        });

        it('should reject with any error thrown by constructEmbeddedMessage()', () => {
            const error = new Error('Some fake error');
            constructEmbeddedMessageStub.throws(error);

            return sendMessageToChannel(header, message, channel, avatarUrl)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    constructEmbeddedMessageStub.should.have.been.calledOnce;
                    constructEmbeddedMessageStub.should.have.been.calledWithExactly(header, message, avatarUrl);

                    channel.send.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should reject with any error thrown by channel.send()', () => {
            const error = new Error('Some fake error');
            channel.send.throws(error);

            return sendMessageToChannel(header, message, channel, avatarUrl)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    constructEmbeddedMessageStub.should.have.been.calledOnce;
                    constructEmbeddedMessageStub.should.have.been.calledWithExactly(header, message, avatarUrl);

                    channel.send.should.have.been.calledOnce;
                    channel.send.should.have.been.calledWithExactly(embeddedMessage);

                    err.should.be.equal(error);
                });
        });

        it('should resolve void after executing as expected', () => {
            return sendMessageToChannel(header, message, channel, avatarUrl)
                .then(result => {
                    defaultRetryStub.should.have.been.calledOnce;

                    constructEmbeddedMessageStub.should.have.been.calledOnce;
                    constructEmbeddedMessageStub.should.have.been.calledWithExactly(header, message, avatarUrl);

                    channel.send.should.have.been.calledOnce;
                    channel.send.should.have.been.calledWithExactly(embeddedMessage);

                    should().not.exist(result);
                });
        });
    });

    describe('removeUserFromMessageReaction', () => {
        let messageReaction: MessageReaction;
        let removeStub: sinon.SinonStub<[UserResolvable], MessageReaction>;

        let user: StubbedInstance<User>;

        let defaultRetryStub: sinon.SinonStub<[() => any | Promise<any>], Promise<any>>;

        beforeEach(() => {
            removeStub = sandbox.stub<[UserResolvable], MessageReaction>();
            messageReaction = {
                users: {
                    remove: removeStub
                }
            } as any as MessageReaction;

            user = stubInterface<User>();

            defaultRetryStub = sandbox.stub(factory, 'defaultRetry').callsFake(fakeDefaultRetry);
        });

        it('should reject with any error thrown by messageReaction.users.remove', () => {
            const error = new Error('Some fake error');
            removeStub.rejects(error);

            return removeUserFromMessageReaction(messageReaction, user)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    defaultRetryStub.should.have.been.calledOnce;

                    removeStub.should.have.been.calledOnce;
                    removeStub.should.have.been.calledWithExactly(user);

                    err.should.be.equal(error);
                });
        });

        it('should resolve void on success', () => {
            removeStub.resolves(messageReaction);

            return removeUserFromMessageReaction(messageReaction, user)
                .then(result => {
                    defaultRetryStub.should.have.been.calledOnce;

                    removeStub.should.have.been.calledOnce;
                    removeStub.should.have.been.calledWithExactly(user);

                    should().not.exist(result);
                });
        });
    });
});
