import sinon, { stubInterface, StubbedInstance, stubObject } from 'ts-sinon';
import { should } from 'chai';
import { TextChannel, MessageReaction, User, PartialUser } from 'discord.js';

import * as discordHelpers from '../../../../../src/lib/discord-helpers';
import { RequestTrainingHandler } from '../../../../../src/events/message-reaction-add';
import { VatsimApi } from '../../../../../src/lib/vatsim';
import { Logger } from '../../../../../src/lib/logger';

describe('RequestTrainingHandler', () => {
    const messageId = 'some-message-id';
    const emojiName = 'some-emoji-name';
    const trainingRequestChannelId = 'some-channel-id';
    const calendarUrl = '?date=';

    let getTextChannel: sinon.SinonStub<[string], TextChannel>;
    let vatsimApi: StubbedInstance<VatsimApi>;
    let logger: StubbedInstance<Logger>;
    
    let handler: RequestTrainingHandler;

    let sandbox: sinon.SinonSandbox;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        getTextChannel = sandbox.stub<[string], TextChannel>();
        vatsimApi = stubInterface<VatsimApi>();
        logger = stubInterface<Logger>();

        handler = new RequestTrainingHandler(messageId, emojiName, trainingRequestChannelId, getTextChannel, calendarUrl, vatsimApi, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should construct an instance as expected', () => {
            handler.should.be.deep.equal({
                messageId,
                emojiName,
                trainingRequestChannelId,
                getTextChannel,
                calendarUrl,
                vatsimApi,
                logger
            });
        });

        it('should construct an instance as expected - secondary', () => {
            const messageId = 'another-message-id';
            const emojiName = 'another-emoji-name';
            const trainingRequestChannelId = 'another-channel-id';
            const calendarUrl = '?test=true&date=';

            handler = new RequestTrainingHandler(messageId, emojiName, trainingRequestChannelId, getTextChannel, calendarUrl, vatsimApi, logger);
            
            handler.should.be.deep.equal({
                messageId,
                emojiName,
                trainingRequestChannelId,
                getTextChannel,
                calendarUrl,
                vatsimApi,
                logger
            });
        });
    });

    describe('supported', () => {
        let messageReaction: MessageReaction;
        let user: User;

        beforeEach(() => {
            messageReaction = {
                message: { id: messageId },
                emoji: { name: emojiName }
            } as MessageReaction;
            user = { bot: false } as User;
        });

        it('should throw an error if the messageReaction is undefined', () => {
            messageReaction = undefined;
            should().not.exist(messageReaction);

            return Promise.resolve()
                .then(() => handler.supported(messageReaction, user))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    err.should.be.an.instanceOf(Error);
                    err.message.should.be.equal(`Cannot read property 'emoji' of undefined`);
                });
        });

        it('should throw an error if the messageReaction.emoji is undefined', () => {
            messageReaction = { message: { id: messageId } } as MessageReaction;
            should().not.exist(messageReaction.emoji);

            return Promise.resolve()
                .then(() => handler.supported(messageReaction, user))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    err.should.be.an.instanceOf(Error);
                    err.message.should.be.equal(`Cannot read property 'name' of undefined`);
                });
        });

        it('should throw an error if the user is undefined', () => {
            user = undefined;
            should().not.exist(user);

            return Promise.resolve()
            .then(() => handler.supported(messageReaction, user))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    err.should.be.an.instanceOf(Error);
                    err.message.should.be.equal(`Cannot read property 'bot' of undefined`);
                });
        });

        it('should throw an error if the messageReaction.message is undefined', () => {
            messageReaction.message = undefined;
            should().not.exist(messageReaction.message);

            return Promise.resolve()
            .then(() => handler.supported(messageReaction, user))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    err.should.be.an.instanceOf(Error);
                    err.message.should.be.equal(`Cannot read property 'id' of undefined`);
                });
        });

        it('should return false if the emojiName does not match', () => {
            messageReaction.emoji.name = 'some other emoji';
            messageReaction.emoji.name.should.be.not.equal(emojiName);

            const result = handler.supported(messageReaction, user);
            result.should.be.false;
        });

        it('should return false if the user is a bot', () => {
            user.bot = true;
            user.bot.should.be.true;

            const result = handler.supported(messageReaction, user);
            result.should.be.false;
        });

        it('should return false if the messageId does not match', () => {
            messageReaction.message.id = 'some other message id';
            messageReaction.message.id.should.be.not.equal(messageId);

            const result = handler.supported(messageReaction, user);
            result.should.be.false;
        });

        it('should return true if all criteria are met', () => {
            const result = handler.supported(messageReaction, user);
            result.should.be.true;
        });
    });

    describe('handle', () => {
        const userId = '123';
        const username = 'some user';

        let messageReaction: StubbedInstance<MessageReaction>;
        let user: StubbedInstance<User>;

        let giveTrainingStub: sinon.SinonStub<[User | PartialUser, MessageReaction], Promise<void>>;
        let resetMessageReactionStub: sinon.SinonStub<[MessageReaction, Logger], Promise<void>>;
        let applyReactionToMessageStub: sinon.SinonStub<[MessageReaction, string], Promise<void>>;

        beforeEach(() => {
            messageReaction = stubInterface<MessageReaction>();
            user = stubObject<User>({
                id: userId,
                username
            } as User);

            giveTrainingStub = sandbox.stub(handler, 'giveTraining').resolves(undefined);
            resetMessageReactionStub = sandbox.stub(discordHelpers, 'resetMessageReaction').resolves(undefined);
            applyReactionToMessageStub = sandbox.stub(discordHelpers, 'applyReactionToMessage').resolves(undefined);
        });

        it('should resolve void after swallowing any error thrown by handler.giveTraining()', () => {
            const error = new Error('Some fake error');
            giveTrainingStub.rejects(error);

            return handler.handle(messageReaction, user)
                .then(result => {
                    giveTrainingStub.should.have.been.calledOnce;
                    giveTrainingStub.should.have.been.calledWithExactly(user, messageReaction);

                    resetMessageReactionStub.should.not.have.been.called;
                    applyReactionToMessageStub.should.not.have.been.called;

                    logger.info.should.not.have.been.called;

                    logger.error.should.have.been.calledOnce;
                    logger.error.should.have.been.calledWithExactly(`Training request unsuccessful for ${username} (${userId})`);

                    should().not.exist(result);
                });
        });

        it('should resolve void after swallowing any error thrown by resetMessageReaction()', () => {
            const error = new Error('Some fake error');
            resetMessageReactionStub.rejects(error);

            return handler.handle(messageReaction, user)
                .then(result => {
                    giveTrainingStub.should.have.been.calledOnce;
                    giveTrainingStub.should.have.been.calledWithExactly(user, messageReaction);

                    resetMessageReactionStub.should.have.been.calledOnce;
                    resetMessageReactionStub.should.have.been.calledWithExactly(messageReaction, logger);

                    applyReactionToMessageStub.should.not.have.been.called;

                    logger.info.should.not.have.been.called;

                    logger.error.should.have.been.calledOnce;
                    logger.error.should.have.been.calledWithExactly(`Training request unsuccessful for ${username} (${userId})`);

                    should().not.exist(result);
                });
        });

        it('should resolve void after swallowing any error thrown by applyReactionToMessage()', () => {
            const error = new Error('Some fake error');
            applyReactionToMessageStub.rejects(error);

            return handler.handle(messageReaction, user)
                .then(result => {
                    giveTrainingStub.should.have.been.calledOnce;
                    giveTrainingStub.should.have.been.calledWithExactly(user, messageReaction);

                    resetMessageReactionStub.should.have.been.calledOnce;
                    resetMessageReactionStub.should.have.been.calledWithExactly(messageReaction, logger);

                    applyReactionToMessageStub.should.have.been.calledOnce;
                    applyReactionToMessageStub.should.have.been.calledWithExactly(messageReaction, emojiName);

                    logger.info.should.not.have.been.called;

                    logger.error.should.have.been.calledOnce;
                    logger.error.should.have.been.calledWithExactly(`Training request unsuccessful for ${username} (${userId})`);

                    should().not.exist(result);
                });
        });

        it('should resolve void after successfully handling the messageReaction', () => {
            return handler.handle(messageReaction, user)
                .then(result => {
                    giveTrainingStub.should.have.been.calledOnce;
                    giveTrainingStub.should.have.been.calledWithExactly(user, messageReaction);

                    resetMessageReactionStub.should.have.been.calledOnce;
                    resetMessageReactionStub.should.have.been.calledWithExactly(messageReaction, logger);

                    applyReactionToMessageStub.should.have.been.calledOnce;
                    applyReactionToMessageStub.should.have.been.calledWithExactly(messageReaction, emojiName);

                    logger.info.should.have.been.calledOnce;
                    logger.info.should.have.been.calledWithExactly(`Training requested by ${username} (${userId})`);

                    logger.error.should.not.have.been.called;

                    should().not.exist(result);
                });
        });
    });

    describe('giveTraining', () => {
        // skipping this for now as i anticipate big changes here based on the issues/enhancements requested in the repo
    });
});
