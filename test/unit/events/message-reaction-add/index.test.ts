import * as MessageReactionAddModule from '../../../../src/events/message-reaction-add';
import { AssignRoleHandler, RequestTrainingHandler } from '../../../../src/events/message-reaction-add/handlers';


describe('MessageReactionAddModule', () => {
    it('should export the expected resources', () => {
        MessageReactionAddModule.should.be.deep.equal({
            AssignRoleHandler,
            RequestTrainingHandler
        });
    });
});
