import * as MessageModule from '../../../../src/events/message';
import { EventManager } from '../../../../src/events/message/event-manager';
import { CheckHandler, TestMessageHandler } from '../../../../src/events/message/handlers';


describe('MessageModule', () => {
    it('should export the expected resources', () => {
        MessageModule.should.be.deep.equal({
            EventManager,
            CheckHandler,
            TestMessageHandler,
        });
    });
});
