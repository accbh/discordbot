import { should } from 'chai';
import { ClientEvents, Message } from 'discord.js';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { EventManager } from '../../../../src/events/message/event-manager';
import { EventHandler } from '../../../../src/events/message/types';
import { Logger } from '../../../../src/lib/logger';

describe('EventManager', () => {
    const messagePrefix = 'prefix';

    let handlerA: StubbedInstance<EventHandler>;
    let handlerB: StubbedInstance<EventHandler>;

    let handlers: StubbedInstance<EventHandler>[];
    let logger: StubbedInstance<Logger>;
    let manager: EventManager;

    const expectedHookName: keyof ClientEvents = 'message';

    beforeEach(() => {
        handlerA = stubInterface<EventHandler>();
        handlerB = stubInterface<EventHandler>();

        handlers = [handlerA, handlerB];
        logger = stubInterface<Logger>();

        manager = new EventManager(handlers, messagePrefix, logger);
    });

    describe('constructor', () => {
        it('should construct an instance as expected', () => {
            manager.should.be.deep.equal({
                handlers,
                messagePrefix,
                logger,
                messagePrefixRegex: /^prefix/gi
            });
        });
    });

    describe('getHooks', () => {
        const getHook = manager => {
            const hooks = manager.getHooks();
            hooks.should.be.an('array');
            hooks.length.should.be.equal(1);

            const hook = hooks[0];
            Object.keys(hook).should.be.deep.equal(['name', 'listener']);
            hook.name.should.be.equal(expectedHookName);
            hook.listener.should.be.a('function');

            return hook;
        };

        it('should return the expected array', () => {
            getHook(manager);
        });

        describe('listener', () => {
            const command = 'some-command';
            const first = 1;
            const second = 'some-context';
            const message: Message = {
                content: `${messagePrefix}${command} ${first} ${second}`
            } as Message;

            it('should return void without doing anything if the prefix is not matched', () => {
                return getHook(manager).listener(`some-otherprefix-${message}`)
                    .then(result => {
                        handlerA.supported.should.not.have.been.called;
                        handlerB.supported.should.not.have.been.called;

                        logger.warn.should.not.have.been.called;

                        handlerA.handle.should.not.have.been.called;
                        handlerB.handle.should.not.have.been.called;

                        logger.error.should.not.have.been.called;

                        should().not.exist(result);
                    });
            });

            it('should log an error if no handlers have been provided', () => {
                handlers = [];
                manager = new EventManager(handlers, messagePrefix, logger);

                return getHook(manager).listener(message)
                    .then(result => {
                        handlerA.supported.should.not.have.been.called;
                        handlerB.supported.should.not.have.been.called;

                        logger.warn.should.have.been.calledOnce;
                        logger.warn.should.have.been.calledWithExactly(`No handlers found able to handle command '${command}'`);

                        handlerA.handle.should.not.have.been.called;
                        handlerB.handle.should.not.have.been.called;

                        logger.error.should.not.have.been.called;

                        should().not.exist(result);
                    });
            });

            it('should log an error if no handlers support the params', () => {
                return getHook(manager).listener(message)
                    .then(result => {
                        handlerA.supported.should.have.been.calledOnce;
                        handlerA.supported.should.have.been.calledWithExactly(command, [`${first}`, second], message);
                        handlerB.supported.should.have.been.calledOnce;
                        handlerB.supported.should.have.been.calledWithExactly(command, [`${first}`, second], message);

                        logger.warn.should.have.been.calledOnce;
                        logger.warn.should.have.been.calledWithExactly(`No handlers found able to handle command '${command}'`);

                        handlerA.handle.should.not.have.been.called;
                        handlerB.handle.should.not.have.been.called;

                        logger.error.should.not.have.been.called;

                        should().not.exist(result);
                    });
            });

            it('should invoke all handler.handle()functions where supported, and resolve void after swallowing the errors returned by the handlers', () => {
                handlerA.supported.returns(false);
                handlerB.supported.returns(true);

                const error = new Error('Some fake error');
                handlerB.handle.rejects(error);

                return getHook(manager).listener(message)
                    .then(result => {
                        handlerA.supported.should.have.been.calledOnce;
                        handlerA.supported.should.have.been.calledWithExactly(command, [`${first}`, second], message);

                        handlerB.supported.should.have.been.calledOnce;
                        handlerB.supported.should.have.been.calledWithExactly(command, [`${first}`, second], message);

                        logger.warn.should.not.have.been.called;
                        handlerA.handle.should.not.have.been.called;

                        handlerB.handle.should.have.been.calledOnce;
                        handlerB.handle.should.have.been.calledWithExactly(command, [`${first}`, second], message);

                        logger.error.should.have.been.calledOnce;
                        logger.error.should.have.been.calledWithExactly(error.message);

                        should().not.exist(result);
                    });
            });

            it('should invoke all handler.handle()functions where supported, and resolve void after all handlers succeed', () => {
                handlerA.supported.returns(true);
                handlerB.supported.returns(true);

                return getHook(manager).listener(message)
                    .then(result => {
                        handlerA.supported.should.have.been.calledOnce;
                        handlerA.supported.should.have.been.calledWithExactly(command, [`${first}`, second], message);

                        handlerB.supported.should.have.been.calledOnce;
                        handlerB.supported.should.have.been.calledWithExactly(command, [`${first}`, second], message);

                        logger.warn.should.not.have.been.called;

                        handlerA.handle.should.have.been.calledOnce;
                        handlerA.handle.should.have.been.calledWithExactly(command, [`${first}`, second], message);

                        handlerB.handle.should.have.been.calledOnce;
                        handlerB.handle.should.have.been.calledWithExactly(command, [`${first}`, second], message);

                        logger.error.should.not.have.been.called;

                        should().not.exist(result);
                    });
            });
        });
    });
});
