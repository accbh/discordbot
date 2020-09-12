import * as LoggerModule from '../../../../src/lib/logger/index';
import * as types from '../../../../src/lib/logger/types';
import * as ConsoleLogger from '../../../../src/lib/logger/console-logger';


describe('EventHandlersModule', () => {
    it('should export the expected resources', () => {
        LoggerModule.should.be.deep.equal({
            ...types,
            ...ConsoleLogger
        });
    });
});
