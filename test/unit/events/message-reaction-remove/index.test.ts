import * as MessageReactionRemoveModule from '../../../../src/events/message-reaction-remove';
import { CancelTrainingRequestHandler } from '../../../../src/events/message-reaction-remove/handlers/cancel-training-request';
import { RevokeRoleHandler } from '../../../../src/events/message-reaction-remove/handlers/revoke-role';


describe('MessageReactionRemoveModule', () => {
    it('should export the expected resources', () => {
        MessageReactionRemoveModule.should.be.deep.equal({
            CancelTrainingRequestHandler,
            RevokeRoleHandler
        });
    });
});
