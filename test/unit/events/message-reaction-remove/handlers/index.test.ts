import * as MessageReactionRemoveHandlersModule from '../../../../../src/events/message-reaction-remove/handlers';
import { RevokeRoleHandler } from '../../../../../src/events/message-reaction-remove/handlers/revoke-role';


describe('MessageReactionRemoveHandlersModule', () => {
    it('should export the expected resources', () => {
        MessageReactionRemoveHandlersModule.should.be.deep.equal({
            RevokeRoleHandler
        });
    });
});
