import * as GuildMemberAddHandlersModule from '../../../../../src/events/guild-member-add/handlers';
import { SendWelcomeMessageHandler } from '../../../../../src/events/guild-member-add/handlers/send-welcome-message';


describe('GuildMemberAddHandlersModule', () => {
    it('should export the expected resources', () => {
        GuildMemberAddHandlersModule.should.be.deep.equal({
            SendWelcomeMessageHandler
        });
    });
});
