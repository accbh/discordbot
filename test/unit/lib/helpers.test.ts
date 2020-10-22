import sinon from 'ts-sinon';
import BluebirdRetry from 'bluebird-retry';

import { should } from 'chai';

import { jsonParser, jsonReviver, defaultRetry, retry, factory } from '../../../src/lib/helpers';

describe('Helper', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('jsonParser', () => {
        it('should convert a string to json', () => {
            const str = '{"hello":"world"}';
            const result = jsonParser(str);
            result.should.be.deep.equal({ hello: 'world' });
        });

        it('should parse date strings as Date objects', () => {
            const dateString = '2019-04-12T13:55:12.943Z';
            const str = `{"hello":"world","timestamp":"${dateString}"}`;
            const result = jsonParser(str);
            result.should.be.deep.equal({ hello: 'world', timestamp: new Date(dateString) });
        });
    });

    describe('jsonReviver', () => {
        it('should return dateString as a Date', () => {
            const value = '2019-04-12T13:55:12.943Z';
            const result = jsonReviver('', value);
            result.should.be.deep.equal(new Date(value));
        });

        it('should return the value as is if not a valid date string', () => {
            const value = '2019-04-12T13:55:12';
            const result = jsonReviver('', value);
            result.should.be.deep.equal(new Date(`${value}.000Z`));
        });

        it('should return the value as is if not a valid date string', () => {
            const value = '2019-04-12T13';
            const result = jsonReviver('', value);
            result.should.be.equal(value);
        });

        it('should return the value as is', () => {
            const value = new Date();
            const result = jsonReviver('', value);
            result.should.be.equal(value);
        });

        it('should return the value as is', () => {
            const value = 'hello';
            const result = jsonReviver('', value);
            result.should.be.equal(value);
        });

        it('should return the value as is', () => {
            const value = 596423;
            const result = jsonReviver('', value);
            result.should.be.equal(value);
        });
    });

    describe('defaultRetry', () => {
        let retryStub: sinon.SinonStub<[() => any | Promise<any>, BluebirdRetry.Options], Promise<any>>;
        let stub: sinon.SinonStub<[], string>;

        beforeEach(() => {
            retryStub = sandbox.stub(factory, 'retry');
            stub = sandbox.stub<[], string>();
        });

        it('should invoke retry with the supplied func and the expected default options', () => {
            return defaultRetry(stub)
                .then(result => {
                    retryStub.should.have.been.calledOnce;
                    retryStub.should.have.been.calledWithExactly(stub, { max_tries: 5, interval: 25, backoff: 2 });

                    stub.should.not.have.been.called;

                    should().not.exist(result);
                });
        });
    });

    describe('retry', () => {
        const MAX_TRIES = 5;
        const fakeResult = 'Hello world';

        let options: BluebirdRetry.Options;

        beforeEach(() => {
            options = { max_tries: MAX_TRIES, interval: 2 };
        });

        describe('with synchronous functions', () => {
            let stub: sinon.SinonStub<[], string>;

            beforeEach(() => {
                stub = sandbox.stub<[], string>().returns(fakeResult);
            });

            it('should reject any error thrown by func after attempting the max allowd times', () => {
                const error = new Error('Some fake error');
                stub.throws(error);

                return retry(stub, options)
                    .then(() => {
                        throw new Error('Expected an error to be thrown but got success');
                    }, err => {
                        stub.should.have.callCount(MAX_TRIES);
                        for (let i = 0; i < MAX_TRIES; i++) {
                            stub.getCall(i).should.have.been.calledWithExactly();
                        }

                        err.should.be.equal(error);
                    });
            });

            it('should resolve the result of func when func failed but eventually succeeds', () => {
                const error = new Error('Some fake error');
                const allowedToErrorCount = MAX_TRIES - 1;

                for (let i = 0; i < allowedToErrorCount; i++) {
                    stub.onCall(i).throws(error);
                }

                return retry(stub, options)
                    .then(result => {
                        stub.should.have.callCount(MAX_TRIES);
                        for (let i = 0; i < MAX_TRIES; i++) {
                            stub.getCall(i).should.have.been.calledWithExactly();
                        }

                        result.should.be.equal(fakeResult);
                    });
            });

            it('should resolve the result of func when func succeeds on first attempt', () => {
                return retry(stub, options)
                    .then(result => {
                        stub.should.have.been.calledOnce;
                        stub.should.have.been.calledWithExactly();

                        result.should.be.equal(fakeResult);
                    });
            });
        });

        describe('with asynchronous functions', () => {
            let stub: sinon.SinonStub<[], Promise<string>>;

            beforeEach(() => {
                stub = sandbox.stub<[], Promise<string>>().resolves(fakeResult);
            });

            it('should reject any error thrown by func after attempting the max allowd times', () => {
                const error = new Error('Some fake error');
                stub.rejects(error);

                return retry(stub, options)
                    .then(() => {
                        throw new Error('Expected an error to be thrown but got success');
                    }, err => {
                        stub.should.have.callCount(MAX_TRIES);
                        for (let i = 0; i < MAX_TRIES; i++) {
                            stub.getCall(i).should.have.been.calledWithExactly();
                        }

                        err.should.be.equal(error);
                    });
            });

            it('should resolve the result of func when func failed but eventually succeeds', () => {
                const error = new Error('Some fake error');
                const allowedToErrorCount = MAX_TRIES - 1;

                for (let i = 0; i < allowedToErrorCount; i++) {
                    stub.onCall(i).rejects(error);
                }

                return retry(stub, options)
                    .then(result => {
                        stub.should.have.callCount(MAX_TRIES);
                        for (let i = 0; i < MAX_TRIES; i++) {
                            stub.getCall(i).should.have.been.calledWithExactly();
                        }

                        result.should.be.equal(fakeResult);
                    });
            });

            it('should resolve the result of func when func succeeds on first attempt', () => {
                return retry(stub, options)
                    .then(result => {
                        stub.should.have.been.calledOnce;
                        stub.should.have.been.calledWithExactly();

                        result.should.be.equal(fakeResult);
                    });
            });
        });
    });
});
