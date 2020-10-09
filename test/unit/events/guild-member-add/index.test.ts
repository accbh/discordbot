import * as GuildMemberAddModule from '../../../../src/events/guild-member-add';
import { SendWelcomeMessageHandler } from '../../../../src/events/guild-member-add/handlers/send-welcome-message';


describe('GuildMemberAddsModule', () => {
    it('should export the expected resources', () => {
        GuildMemberAddModule.should.be.deep.equal({
            SendWelcomeMessageHandler
        });
    });
});
