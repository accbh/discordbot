import sinon, { stubInterface, StubbedInstance, stubObject } from 'ts-sinon';
import { MessageReaction, User } from 'discord.js';
import { should } from 'chai';

import { CancelTrainingRequestHandler } from '../../../../../src/events/message-reaction-remove/handlers/cancel-training-request';


describe('CancelRequestTrainingHandler', () => {
    const messageId = 'some-message-id';
    const emojiName = 'some-emoji-name';

    let handler: CancelTrainingRequestHandler;

    let sandbox: sinon.SinonSandbox;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        handler = new CancelTrainingRequestHandler(messageId, emojiName);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should construct an instance as expected', () => {
            handler.should.be.deep.equal({
                messageId,
                emojiName,
            });
        });

        it('should construct an instance as expected - secondary', () => {
            const messageId = 'another-message-id';
            const emojiName = 'another-emoji-name';

            handler = new CancelTrainingRequestHandler(messageId, emojiName);

            handler.should.be.deep.equal({
                messageId,
                emojiName,
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

        it('should return true if the user is undefined', () => {
            user = undefined;
            should().not.exist(user);

            const result = handler.supported(messageReaction, user);
            result.should.be.true;
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

        it('should return true if the user is a bot', () => {
            user.bot = true;
            user.bot.should.be.true;

            const result = handler.supported(messageReaction, user);
            result.should.be.true;
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

        beforeEach(() => {
            messageReaction = stubInterface<MessageReaction>();
            user = stubObject<User>({
                id: userId,
                username
            } as User);
        });

        it('should resolve without doing anything', () => {
            return handler.handle(messageReaction, user)
                .then(result => {
                    should().not.exist(result);
                });
        });
    });
});
