import sinon from 'ts-sinon';
import { should } from 'chai';
import { AppError } from '../../../src/lib/errors';

describe('Errors', () => {
    let sandbox: sinon.SinonSandbox;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('AppError', () => {
        describe('constructor', () => {
            let supportsCaptureStackTraceStub: any;

            beforeEach(() => {
                supportsCaptureStackTraceStub = sandbox.stub(AppError, 'supportsCaptureStackTrace');
            });

            it('should construct as expected, with the expected properties when hasStackTrace is supported', () => {
                const detailed = 'Area 51 was just raided by aliens';
                const message = 'Men wearing tinfoil hats believe aliens attacked USA';

                supportsCaptureStackTraceStub.returns(true);

                const error = new AppError(detailed, message);

                supportsCaptureStackTraceStub.should.have.been.calledOnce;
                supportsCaptureStackTraceStub.should.have.been.calledWithExactly();

                error.should.be.instanceOf(AppError);

                error.name.should.be.equal('AppError');
                error.message.should.be.equal(message);
                error.detailed.should.be.equal(detailed);

                const regex = /AppError: Men wearing tinfoil hats believe aliens attacked USA/;
                regex.test(error.stack).should.be.true;
            });

            it('should construct as expected, with the expected properties when hasStackTrace is not supported', () => {
                const detailed = 'Area 51 was just raided by aliens';
                const message = 'Men wearing tinfoil hats believe aliens attacked USA';

                supportsCaptureStackTraceStub.returns(false);

                const error = new AppError(detailed, message);

                supportsCaptureStackTraceStub.should.have.been.calledOnce;
                supportsCaptureStackTraceStub.should.have.been.calledWithExactly();

                error.should.be.instanceOf(AppError);

                error.name.should.be.equal('AppError');
                error.message.should.be.equal(message);
                error.detailed.should.be.equal(detailed);

                const regex = /Error: Men wearing tinfoil hats believe aliens attacked USA/;
                regex.test(error.stack).should.be.true;
            });

            it('should construct as expected, when hasStackTrace is supported amd only a message is supplied', () => {
                const message = 'Area 51 was just raided by aliens';

                supportsCaptureStackTraceStub.returns(true);

                const error = new AppError(undefined, message);

                supportsCaptureStackTraceStub.should.have.been.calledOnce;
                supportsCaptureStackTraceStub.should.have.been.calledWithExactly();

                error.should.be.instanceOf(AppError);

                error.name.should.be.equal('AppError');
                error.message.should.be.equal(message);
                error.detailed.should.be.equal(message);

                const regex = /AppError: Area 51 was just raided by aliens/;
                regex.test(error.stack).should.be.true;
            });

            it('should construct as expected, when hasStackTrace is not supported amd only a message is supplied', () => {
                const message = 'Area 51 was just raided by aliens';

                supportsCaptureStackTraceStub.returns(false);

                const error = new AppError(undefined, message);

                supportsCaptureStackTraceStub.should.have.been.calledOnce;
                supportsCaptureStackTraceStub.should.have.been.calledWithExactly();

                error.should.be.instanceOf(AppError);

                error.name.should.be.equal('AppError');
                error.message.should.be.equal(message);
                error.detailed.should.be.equal(message);

                const regex = /Error: Area 51 was just raided by aliens/;
                regex.test(error.stack).should.be.true;
            });

            it('should construct as expected, with the expected properties when hasStackTrace is supported', () => {
                const detailed = 'Area 51 was just raided by aliens';
                const message = 'Men wearing tinfoil hats believe aliens attacked USA';

                supportsCaptureStackTraceStub.returns(true);

                const error = new AppError(detailed, message);

                supportsCaptureStackTraceStub.should.have.been.calledOnce;
                supportsCaptureStackTraceStub.should.have.been.calledWithExactly();

                error.should.be.instanceOf(AppError);

                error.name.should.be.equal('AppError');
                error.message.should.be.equal(message);
                error.detailed.should.be.equal(detailed);

                const regex = /AppError: Men wearing tinfoil hats believe aliens attacked USA/;
                regex.test(error.stack).should.be.true;
            });

            it('should construct as expected, with the expected properties when no detail is supplied, and hasStackTrace is not supported', () => {
                const message = 'Men wearing tinfoil hats believe aliens attacked USA';

                supportsCaptureStackTraceStub.returns(false);

                const error = new AppError(undefined, message);

                supportsCaptureStackTraceStub.should.have.been.calledOnce;
                supportsCaptureStackTraceStub.should.have.been.calledWithExactly();

                error.should.be.instanceOf(AppError);

                error.name.should.be.equal('AppError');
                error.message.should.be.equal(message);
                error.detailed.should.be.equal(message);

                const regex = /Error: Men wearing tinfoil hats believe aliens attacked USA/;
                regex.test(error.stack).should.be.true;
            });
        });

        describe('hasStackTrace', () => {
            it('should return true if Error.captureStackTrace is a function', () => {
                // this method purely depends on the version of node, no real test can be applied
                const result = AppError.supportsCaptureStackTrace();

                if (result) {
                    Error.captureStackTrace.should.be.a('function');
                } else {
                    should().not.exist(Error.captureStackTrace);
                }
            });
        });
    });
});
