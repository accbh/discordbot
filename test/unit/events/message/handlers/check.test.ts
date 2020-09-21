import { Message } from 'discord.js';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { CheckHandler } from '../../../../../src/events/message';
import { Logger } from '../../../../../src/lib/logger';
import { VatsimApi } from '../../../../../src/lib/vatsim';

describe('CheckHandler', () => {
    let allowedCommandUserIds: string[];
    let vatsimApi: StubbedInstance<VatsimApi>;
    let logger: StubbedInstance<Logger>;
    let handler: CheckHandler;

    beforeEach(() => {
        allowedCommandUserIds = [];
        vatsimApi = stubInterface<VatsimApi>();
        logger = stubInterface<Logger>();

        handler = new CheckHandler(allowedCommandUserIds, vatsimApi, logger);
    });

    describe('constructor', () => {
        it('should construct an instance as expected', () => {
            handler.should.be.deep.equal({
                allowedCommandUserIds,
                vatsimApi,
                logger
            });
        });
    });

    describe('supported', () => {
        const authorId = '12345';
        const command: string = 'check';

        let args: string[];
        let message: Message;

        beforeEach(() => {
            args = [];
            message = {
                author: {
                    id: authorId,
                    bot: false
                }
            } as Message;

            allowedCommandUserIds.push(authorId);
        });

        it('should return true when all conditions are met', () => {
            const result = handler.supported(command, args, message);
            console.log(result);
            result.should.be.true;
        });

        it(`should return false if the command is not 'check'`, () => {
            const command = 'some-other-command';
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });

        it('should return false if the the author is a bot', () => {
            message.author.bot = true;
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });

        it('should return false if the the author.id is not in the list of allowedCommandUserIds', () => {
            message.author.id = 'not-the-same-id';
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });
    });
});
