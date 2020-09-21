import * as EventsModule from '../../../src/events';

import { EventManager } from '../../../src/events/event-manager';
import * as GuildMemberAdd from '../../../src/events/guild-member-add';
import * as Message from '../../../src/events/message';
import * as MessageReactionAdd from '../../../src/events/message-reaction-add';
import * as MessageReactionRemove from '../../../src/events/message-reaction-remove';

describe('EventsModule', () => {
    it('should export the expected resources', () => {
        EventsModule.should.be.deep.equal({
            EventManager,
            GuildMemberAdd,
            Message,
            MessageReactionAdd,
            MessageReactionRemove,
        });
    });
});
