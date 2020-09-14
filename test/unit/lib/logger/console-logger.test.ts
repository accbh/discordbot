import sinon from 'ts-sinon';
import MockDate from 'mockdate';
import { ConsoleLogger, LogLevelValue, LogLevel } from '../../../../src/lib/logger';

describe('ConsoleLogger', () => {
    let state: LogLevelValue;
    let logger: ConsoleLogger;

    let sandbox: sinon.SinonSandbox;

    const date = '2020-01-01T12:00:00.000Z';

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        sandbox.restore();

        MockDate.reset();
        MockDate.set(date);

        state = LogLevelValue.INFO;
        logger = new ConsoleLogger(state);
    });

    describe('constructor', () => {
        it('should construct an instance as expected', () => {
            logger.should.be.deep.equal({
                state
            });
        });

        it('should construct an instance as expected', () => {
            logger = new ConsoleLogger(LogLevelValue.FATAL);
            logger.should.be.deep.equal({
                state: LogLevelValue.FATAL
            });
        });
    });

    describe('log', () => {
        const message = 'Some message to log';
        let consoleLogStub: any;

        beforeEach(() => {
            logger['state'].should.be.equal(LogLevelValue.INFO);

            consoleLogStub = sandbox.stub(console, 'log');
        });

        it('should log a message to the console if the level is greater than the state', () => {
            const level: LogLevel = LogLevel.FATAL;

            return Promise.resolve()
                .then(() => logger.log(message, level))
                .then(result => {
                    consoleLogStub.should.have.been.calledOnce;
                    consoleLogStub.should.have.been.calledWithExactly(`${new Date().toISOString()}  ${level} >> ${message}`);
                    
                    result.should.be.equal(logger);
                });
        });

        it('should log a message to the console if the level is equal to the state', () => {
            const level: LogLevel = LogLevel.INFO;

            return Promise.resolve()
                .then(() => logger.log(message, level))
                .then(result => {
                    consoleLogStub.should.have.been.calledOnce;
                    consoleLogStub.should.have.been.calledWithExactly(`${new Date().toISOString()}  ${level} >> ${message}`);

                    result.should.be.equal(logger);
                });
        });

        it('shoul not log a message to the console if the level is equal to the state', () => {
            const level: LogLevel = LogLevel.VERBOSE;

            return Promise.resolve()
                .then(() => logger.log(message, level))
                .then(result => {
                    consoleLogStub.should.not.have.been.called;

                    result.should.be.equal(logger);
                });
        });
    });

    describe('fatal', () => {
        const message = 'Some message to log';
        let logStub: any;

        beforeEach(() => {
            logStub = sandbox.stub(logger, 'log').returns(logger);
        });

        it('should throw any error thrown by logger.log', () => {
            const error = new Error('Some fake error');
            logStub.throws(error);

            return Promise.resolve()
                .then(() => logger.fatal(message))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.FATAL);

                    err.should.be.equal(error);
                });
        });

        it('should return the logger after invoking logger.log as expected and no error is thrown', () => {
            return Promise.resolve()
                .then(() => logger.fatal(message))
                .then(result => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.FATAL);

                    result.should.be.equal(logger);
                });
        });
    });

    describe('error', () => {
        const message = 'Some message to log';
        let logStub: any;

        beforeEach(() => {
            logStub = sandbox.stub(logger, 'log').returns(logger);
        });

        it('should throw any error thrown by logger.log', () => {
            const error = new Error('Some fake error');
            logStub.throws(error);

            return Promise.resolve()
                .then(() => logger.error(message))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.ERROR);

                    err.should.be.equal(error);
                });
        });

        it('should return the logger after invoking logger.log as expected and no error is thrown', () => {
            return Promise.resolve()
                .then(() => logger.error(message))
                .then(result => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.ERROR);

                    result.should.be.equal(logger);
                });
        });
    });

    describe('warn', () => {
        const message = 'Some message to log';
        let logStub: any;

        beforeEach(() => {
            logStub = sandbox.stub(logger, 'log').returns(logger);
        });

        it('should throw any error thrown by logger.log', () => {
            const error = new Error('Some fake error');
            logStub.throws(error);

            return Promise.resolve()
                .then(() => logger.warn(message))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.WARN);

                    err.should.be.equal(error);
                });
        });

        it('should return the logger after invoking logger.log as expected and no error is thrown', () => {
            return Promise.resolve()
                .then(() => logger.warn(message))
                .then(result => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.WARN);

                    result.should.be.equal(logger);
                });
        });
    });

    describe('info', () => {
        const message = 'Some message to log';
        let logStub: any;

        beforeEach(() => {
            logStub = sandbox.stub(logger, 'log').returns(logger);
        });

        it('should throw any error thrown by logger.log', () => {
            const error = new Error('Some fake error');
            logStub.throws(error);

            return Promise.resolve()
                .then(() => logger.info(message))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.INFO);

                    err.should.be.equal(error);
                });
        });

        it('should return the logger after invoking logger.log as expected and no error is thrown', () => {
            return Promise.resolve()
                .then(() => logger.info(message))
                .then(result => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.INFO);

                    result.should.be.equal(logger);
                });
        });
    });

    describe('debug', () => {
        const message = 'Some message to log';
        let logStub: any;

        beforeEach(() => {
            logStub = sandbox.stub(logger, 'log').returns(logger);
        });

        it('should throw any error thrown by logger.log', () => {
            const error = new Error('Some fake error');
            logStub.throws(error);

            return Promise.resolve()
                .then(() => logger.debug(message))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.DEBUG);

                    err.should.be.equal(error);
                });
        });

        it('should return the logger after invoking logger.log as expected and no error is thrown', () => {
            return Promise.resolve()
                .then(() => logger.debug(message))
                .then(result => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.DEBUG);

                    result.should.be.equal(logger);
                });
        });
    });

    describe('verbose', () => {
        const message = 'Some message to log';
        let logStub: any;

        beforeEach(() => {
            logStub = sandbox.stub(logger, 'log').returns(logger);
        });

        it('should throw any error thrown by logger.log', () => {
            const error = new Error('Some fake error');
            logStub.throws(error);

            return Promise.resolve()
                .then(() => logger.verbose(message))
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.VERBOSE);

                    err.should.be.equal(error);
                });
        });

        it('should return the logger after invoking logger.log as expected and no error is thrown', () => {
            return Promise.resolve()
                .then(() => logger.verbose(message))
                .then(result => {
                    logStub.should.have.been.calledOnce;
                    logStub.should.have.been.calledWithExactly(message, LogLevel.VERBOSE);

                    result.should.be.equal(logger);
                });
        });
    });
});
