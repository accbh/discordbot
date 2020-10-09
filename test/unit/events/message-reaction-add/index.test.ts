import * as MessageReactionAddModule from '../../../../src/events/message-reaction-add';
import { AssignRoleHandler } from '../../../../src/events/message-reaction-add/handlers/assign-role';
import { RequestTrainingHandler } from '../../../../src/events/message-reaction-add/handlers/request-training';


describe('MessageReactionAddModule', () => {
    it('should export the expected resources', () => {
        MessageReactionAddModule.should.be.deep.equal({
            AssignRoleHandler,
            RequestTrainingHandler
        });
    });
});
