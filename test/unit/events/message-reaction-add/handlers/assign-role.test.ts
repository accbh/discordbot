import sinon, { StubbedInstance, stubInterface, stubObject } from 'ts-sinon';
import { Message, MessageReaction, User, GuildMember, Role } from 'discord.js';
import { should } from 'chai';

import { AssignRoleHandler } from '../../../../../src/events/message-reaction-add/handlers/assign-role';
import { Logger } from '../../../../../src/lib/logger';
import { ExtractedMessageProps } from '../../../../../src/types';

describe('AssignRoleHandler', () => {
    const roleName = 'some-role-name';
    const messageId = '1234';
    const emojiName = 'some-emoji-name';

    let extractMessageProps: sinon.SinonStub<[Message, User, string], ExtractedMessageProps>;
    let logger: StubbedInstance<Logger>;
    let handler: AssignRoleHandler;

    let sandbox: sinon.SinonSandbox;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        extractMessageProps = sinon.stub<[Message, User, string], ExtractedMessageProps>();
        logger = stubInterface<Logger>();
        handler = new AssignRoleHandler(roleName, messageId, emojiName, extractMessageProps, logger);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should construct the instance as expected', () => {
            handler.should.be.deep.equal({
                roleName,
                messageId,
                emojiName,
                extractMessageProps,
                logger
            });
        });

        it('should construct the instance as expected - secondary', () => {
            const roleName = 'my-role-name';
            const messageId = 'abc';
            const emojiName = 'smiley';
            handler = new AssignRoleHandler(roleName, messageId, emojiName, extractMessageProps, logger);

            handler.should.be.deep.equal({
                roleName,
                messageId,
                emojiName,
                extractMessageProps,
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

        let member: StubbedInstance<GuildMember>;
        let role: StubbedInstance<Role>;

        let addRoleStub: sinon.SinonStub<[string], Promise<GuildMember>>;

        beforeEach(() => {
            messageReaction = stubInterface<MessageReaction>();
            user = stubInterface<User>();

            addRoleStub = sandbox.stub<[string], Promise<GuildMember>>();
            member = stubObject<GuildMember>({ roles: { add: addRoleStub } } as any as GuildMember);
            role = stubInterface<Role>();

            addRoleStub.resolves(member);
            extractMessageProps.returns({ member, role });
        });

        it('should reject with any error thrown by handler.extractMessageProps', () => {
            const error = new Error('Some fake error');
            extractMessageProps.throws(error);

            return handler.handle(messageReaction, user)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    extractMessageProps.should.have.been.calledOnce;
                    extractMessageProps.should.have.been.calledWithExactly(messageReaction.message, user, roleName);

                    err.should.be.equal(error);
                });
        });

        it('should reject with any error rejected by member.roles.add', () => {
            const error = new Error('Some fake error');
            addRoleStub.rejects(error);

            return handler.handle(messageReaction, user)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    extractMessageProps.should.have.been.calledOnce;
                    extractMessageProps.should.have.been.calledWithExactly(messageReaction.message, user, roleName);

                    addRoleStub.should.have.been.calledOnce;
                    addRoleStub.should.have.been.calledWithExactly(role);

                    err.should.be.equal(error);
                });
        });

        it('should resolve void once successfully added role', () => {
            return handler.handle(messageReaction, user)
                .then(result => {
                    extractMessageProps.should.have.been.calledOnce;
                    extractMessageProps.should.have.been.calledWithExactly(messageReaction.message, user, roleName);

                    addRoleStub.should.have.been.calledOnce;
                    addRoleStub.should.have.been.calledWithExactly(role);

                    should().not.exist(result);
                });
        });
    });
});
