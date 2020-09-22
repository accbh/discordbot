import * as MessageHandlersModule from '../../../../../src/events/message/handlers';
import { CheckHandler } from '../../../../../src/events/message/handlers/check';
import { TestMessageHandler } from '../../../../../src/events/message/handlers/test-message';


describe('MessageHandlersModule', () => {
    it('should export the expected resources', () => {
        MessageHandlersModule.should.be.deep.equal({
            CheckHandler,
            TestMessageHandler,
        });
    });
});
