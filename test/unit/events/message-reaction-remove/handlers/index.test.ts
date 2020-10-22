import * as MessageReactionRemoveHandlersModule from '../../../../../src/events/message-reaction-remove/handlers';
import { CancelTrainingRequestHandler } from '../../../../../src/events/message-reaction-remove/handlers/cancel-training-request';
import { RevokeRoleHandler } from '../../../../../src/events/message-reaction-remove/handlers/revoke-role';


describe('MessageReactionRemoveHandlersModule', () => {
    it('should export the expected resources', () => {
        MessageReactionRemoveHandlersModule.should.be.deep.equal({
            CancelTrainingRequestHandler,
            RevokeRoleHandler
        });
    });
});
