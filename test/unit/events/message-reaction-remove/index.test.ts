import * as MessageReactionRemoveModule from '../../../../src/events/message-reaction-remove';
import { RevokeRoleHandler } from '../../../../src/events/message-reaction-remove/handlers/revoke-role';


describe('MessageReactionRemoveModule', () => {
    it('should export the expected resources', () => {
        MessageReactionRemoveModule.should.be.deep.equal({
            RevokeRoleHandler
        });
    });
});
