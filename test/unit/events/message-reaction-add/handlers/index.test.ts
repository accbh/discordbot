import * as MessageReactionAddHandlersModule from '../../../../../src/events/message-reaction-add/handlers';
import { AssignRoleHandler } from '../../../../../src/events/message-reaction-add/handlers/assign-role';
import { RequestTrainingHandler } from '../../../../../src/events/message-reaction-add/handlers/request-training';


describe('MessageReactionAddHandlersModule', () => {
    it('should export the expected resources', () => {
        MessageReactionAddHandlersModule.should.be.deep.equal({
            AssignRoleHandler,
            RequestTrainingHandler
        });
    });
});
