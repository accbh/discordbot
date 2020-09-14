import { SendWelcomeMessageHandler } from '../../../../../src/events/guild-member-add';
import { Logger } from '../../../../../src/lib/logger';
import { GuildMember, Message } from 'discord.js';
import { should } from 'chai';
import { StubbedInstance, stubInterface } from 'ts-sinon';

describe('SendWelcomeMessageHandler', () => {
    const welcomeMessage = 'Some welcome message';

    let logger: StubbedInstance<Logger>;
    let handler: SendWelcomeMessageHandler;

    beforeEach(() => {
        logger = stubInterface<Logger>();
        handler = new SendWelcomeMessageHandler(welcomeMessage, logger);
    });

    describe('constructor', () => {
        it('should construct the instance as expected', () => {
            handler.should.be.deep.equal({
                welcomeMessage,
                logger
            });
        });

        it('should construct the instance as expected - secondary', () => {
            const welcomeMessage = 'Hello';
            handler = new SendWelcomeMessageHandler(welcomeMessage, logger);

            handler.should.be.deep.equal({
                welcomeMessage,
                logger
            });
        });
    });

    describe('supported', () => {
        let member: GuildMember;

        beforeEach(() => {
            member = {
                user: {
                    bot: false
                }
            } as GuildMember;
        });

        it('should throw an error if the member is undefined', () => {
            member = undefined;
            should().not.exist(member);

            return Promise.resolve()
                .then(() => handler.supported(member))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    err.should.be.an.instanceOf(Error);
                    err.message.should.be.equal(`Cannot read property 'user' of undefined`);
                });
        });

        it('should throw an error if the member.user is undefined', () => {
            member.user = undefined;
            should().not.exist(member.user);

            return Promise.resolve()
                .then(() => handler.supported(member))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    err.should.be.an.instanceOf(Error);
                    err.message.should.be.equal(`Cannot read property 'bot' of undefined`);
                });
        });

        it('should return false if the member is a bot user', () => {
            member.user.bot = true;
            member.user.bot.should.be.true;

            const result = handler.supported(member);
            result.should.be.false;
        });

        it('should return false if the member is a bot user', () => {
            member.user.bot.should.be.false;

            const result = handler.supported(member);
            result.should.be.true;
        });
    });

    describe('handle', () => {
        let member: StubbedInstance<GuildMember>;

        beforeEach(() => {
            member = stubInterface<GuildMember>();
        });

        it('should reject with an error if member is undefined', () => {
            member = undefined;
            should().not.exist(member);

            return handler.handle(member)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    err.should.be.an.instanceOf(Error);
                    err.message.should.be.equal(`Cannot read property 'send' of undefined`);
                });
        });

        it('should reject with any error rejected by member.send', () => {
            const error = new Error('Some fake error');
            member.send.rejects(error);

            return handler.handle(member)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    member.send.should.have.been.calledOnce;
                    member.send.should.have.been.calledWithExactly(welcomeMessage);

                    err.should.be.equal(error);
                });
        });

        it('should resolve void after invoking member.send successfully', () => {
            let message: Message = {} as Message;
            member.send.resolves([message]);

            return handler.handle(member)
                .then(result => {
                    member.send.should.have.been.calledOnce;
                    member.send.should.have.been.calledWithExactly(welcomeMessage);

                    should().not.exist(result);
                });
        });
    });
});
