import sinon from 'ts-sinon';

import { jsonParser, jsonReviver, } from '../../../src/lib/helpers';

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
});
