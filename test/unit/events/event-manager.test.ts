import { should } from 'chai';
import { ClientEvents } from 'discord.js';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { EventManager } from '../../../src/events/event-manager';
import { EventHandler } from '../../../src/events/types';
import { Logger } from '../../../src/lib/logger';

describe('EventManager - Generic', () => {
    const hookName: keyof ClientEvents = 'messageReactionAdd';

    let handlerA: StubbedInstance<EventHandler>;
    let handlerB: StubbedInstance<EventHandler>;

    let handlers: StubbedInstance<EventHandler>[];
    let logger: StubbedInstance<Logger>;
    let manager: EventManager;

    beforeEach(() => {
        handlerA = stubInterface<EventHandler>();
        handlerB = stubInterface<EventHandler>();

        handlers = [handlerA, handlerB];
        logger = stubInterface<Logger>();

        manager = new EventManager(hookName, handlers, logger);
    });

    describe('constructor', () => {
        it('should construct an instance as expected', () => {
            manager.should.be.deep.equal({
                hookName,
                handlers,
                logger
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
            hook.name.should.be.equal(hookName);
            hook.listener.should.be.a('function');

            return hook;
        };

        it('should return the expected array', () => {
            getHook(manager);
        });

        describe('listener', () => {
            const first = 'first';
            const second = 2;
            const third = new Date('2020-03-03T03:03:03.300Z');

            it('should log an error if no handlers have been provided', () => {
                handlers = [];
                manager = new EventManager(hookName, handlers, logger);

                const hook = getHook(manager);
                return hook.listener(first, second, third)
                    .then(result => {
                        handlerA.supported.should.not.have.been.called;
                        handlerB.supported.should.not.have.been.called;

                        logger.warn.should.have.been.calledOnce;
                        logger.warn.should.have.been.calledWithExactly(`No handlers found able to handle hook '${hookName}' with args: ${JSON.stringify([first, second, third])}`);

                        handlerA.handle.should.not.have.been.called;
                        handlerB.handle.should.not.have.been.called;

                        logger.error.should.not.have.been.called;

                        should().not.exist(result);
                    });
            });

            it('should log an error if no handlers support the params', () => {
                const hook = getHook(manager);
                return hook.listener(first)
                    .then(result => {
                        handlerA.supported.should.have.been.calledOnce;
                        handlerA.supported.should.have.been.calledWithExactly(first);
                        handlerB.supported.should.have.been.calledOnce;
                        handlerB.supported.should.have.been.calledWithExactly(first);

                        logger.warn.should.have.been.calledOnce;
                        logger.warn.should.have.been.calledWithExactly(`No handlers found able to handle hook '${hookName}' with args: ${JSON.stringify([first])}`);

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

                const hook = getHook(manager);
                return hook.listener(first, second)
                    .then(result => {
                        handlerA.supported.should.have.been.calledOnce;
                        handlerA.supported.should.have.been.calledWithExactly(first, second);

                        handlerB.supported.should.have.been.calledOnce;
                        handlerB.supported.should.have.been.calledWithExactly(first, second);

                        logger.warn.should.not.have.been.called;
                        handlerA.handle.should.not.have.been.called;

                        handlerB.handle.should.have.been.calledOnce;
                        handlerB.handle.should.have.been.calledWithExactly(first, second);

                        logger.error.should.have.been.calledOnce;
                        logger.error.should.have.been.calledWithExactly(error.message);

                        should().not.exist(result);
                    });
            });

            it('should invoke all handler.handle()functions where supported, and resolve void after all handlers succeed', () => {
                handlerA.supported.returns(true);
                handlerB.supported.returns(true);

                const hook = getHook(manager);
                return hook.listener(first, second)
                    .then(result => {
                        handlerA.supported.should.have.been.calledOnce;
                        handlerA.supported.should.have.been.calledWithExactly(first, second);

                        handlerB.supported.should.have.been.calledOnce;
                        handlerB.supported.should.have.been.calledWithExactly(first, second);

                        logger.warn.should.not.have.been.called;

                        handlerA.handle.should.have.been.calledOnce;
                        handlerA.handle.should.have.been.calledWithExactly(first, second);

                        handlerB.handle.should.have.been.calledOnce;
                        handlerB.handle.should.have.been.calledWithExactly(first, second);

                        logger.error.should.not.have.been.called;

                        should().not.exist(result);
                    });
            });
        });
    });
});
