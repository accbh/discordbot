import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';
import { Message, User } from 'discord.js';

import { TestMessageHandler } from '../../../../../src/events/message';
import { Logger } from '../../../../../src/lib/logger';
import { should } from 'chai';

describe('TestMessageHandler', () => {
    const welcomeMessage = 'hello';

    let allowedCommandUserIds: string[];
    let logger: StubbedInstance<Logger>;
    let handler: TestMessageHandler;

    let sandbox: sinon.SinonSandbox;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        allowedCommandUserIds = [];
        logger = stubInterface<Logger>();
        handler = new TestMessageHandler(allowedCommandUserIds, welcomeMessage, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should construct an instance as expected', () => {
            handler.should.be.deep.equal({
                allowedCommandUserIds,
                welcomeMessage,
                logger
            });
        });
    });

    describe('supported', () => {
        const authorId = '12345';
        const command: string = 'testmessage';

        let args: string[];
        let message: Message;

        beforeEach(() => {
            args = [];
            message = {
                author: {
                    id: authorId,
                    bot: false
                }
            } as Message;

            allowedCommandUserIds.push(authorId);
        });

        it('should return true when all conditions are met', () => {
            const result = handler.supported(command, args, message);
            result.should.be.true;
        });

        it(`should return false if the command is not 'check'`, () => {
            const command = 'some-other-command';
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });

        it('should return false if the message is falsey', () => {
            message = undefined;
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });

        it('should return false if message.author is falsey', () => {
            message.author = undefined;
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });

        it('should return false if the the author is a bot', () => {
            message.author.bot = true;
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });

        it('should return false if the the author.id is not in the list of allowedCommandUserIds', () => {
            message.author.id = 'not-the-same-id';
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });
    });

    describe('handle', () => {
        const command = 'testmessage';
        const userId = '1234';
        const username = 'JoeSoap';

        let args: string[];
        let message: Message;
        
        let author: StubbedInstance<User>;

        beforeEach(() => {
            args = [];

            author = stubInterface<User>();
            author.id = userId;
            author.username = username;

            message = {
                author
            } as any as Message;
        });

        it('should reject with any error thrown by message.author.send', () => {
            const error = new Error('Some fake error');
            author.send.rejects(error);

            return handler.handle(command, args, message)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    message.author.send.should.have.been.calledOnce;
                    message.author.send.should.have.been.calledWithExactly(welcomeMessage);

                    logger.info.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should resolve void after sending the welcomeMessage to the author', () => {
            return handler.handle(command, args, message)
                .then(result => {
                    message.author.send.should.have.been.calledOnce;
                    message.author.send.should.have.been.calledWithExactly(welcomeMessage);

                    logger.info.should.have.been.calledOnce;
                    logger.info.should.have.been.calledWithExactly(`Welcome message sent to ${message.author.username} (${message.author.id}).`);

                    should().not.exist(result);
                });
        });
    });
});
