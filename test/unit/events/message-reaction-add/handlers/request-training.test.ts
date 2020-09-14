import sinon, { stubInterface, StubbedInstance } from 'ts-sinon';

import { RequestTrainingHandler } from '../../../../../src/events/message-reaction-add';
import { VatsimApi } from '../../../../../src/lib/vatsim';
import { TextChannel, MessageReaction, User } from 'discord.js';
import { Logger } from '../../../../../src/lib/logger';
import { should } from 'chai';

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
        sandbox.restore();

        getTextChannel = sandbox.stub<[string], TextChannel>();
        vatsimApi = stubInterface<VatsimApi>();
        logger = stubInterface<Logger>();

        handler = new RequestTrainingHandler(messageId, emojiName, trainingRequestChannelId, getTextChannel, calendarUrl, vatsimApi, logger);
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
        let messageReaction: StubbedInstance<MessageReaction>;
        let user: StubbedInstance<User>;

        beforeEach(() => {
            messageReaction = stubInterface<MessageReaction>();
            user = stubInterface<User>();
        });
    });
});
