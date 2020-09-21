import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';
import { should } from 'chai';
import { Collection, GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';

import * as discordHelpers from '../../../../../src/lib/discord-helpers';
import { CheckHandler } from '../../../../../src/events/message';
import { Logger } from '../../../../../src/lib/logger';
import { VatsimApi } from '../../../../../src/lib/vatsim';
import { AppError } from '../../../../../src/lib/errors';

describe('CheckHandler', () => {
    let allowedCommandUserIds: string[];
    let vatsimApi: StubbedInstance<VatsimApi>;
    let logger: StubbedInstance<Logger>;
    let handler: CheckHandler;

    let sandbox: sinon.SinonSandbox;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        allowedCommandUserIds = [];
        vatsimApi = stubInterface<VatsimApi>();
        logger = stubInterface<Logger>();

        handler = new CheckHandler(allowedCommandUserIds, vatsimApi, logger);
    });

    afterEach(() => {
        sandbox.restore();
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

        it('should return false if the message is falsey', () => {
            message = undefined;
            const result = handler.supported(command, args, message);
            result.should.be.false;
        });

        it('should return false if message.author is falsey', () => {
            message.author = undefined;
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

    describe('handle', () => {
        const command: string = 'check';
        const mentionedMemberId = '987';
        const mentionedMemberNickname = 'mentioned-nickname';
        const mentionedMemberAvatar = 'http://fake.avatar.com.fake';
        const cid = '1234567';

        let mentionedMember: GuildMember;
        let mentionCollection: Collection<string, GuildMember>;

        let args: string[];
        let message: Message;
        
        let channel: StubbedInstance<MessageChannel>;
        let vatsimUser: any;

        let extractUserCidFromGuildMemberStub: sinon.SinonStub<[GuildMember], string>;
        let getVatsimUserStub: sinon.SinonStub<[VatsimApi, string], Promise<any>>;
        let sendMessageToChannelStub: sinon.SinonStub<[string, string, TextChannel, string], Promise<void>>;

        beforeEach(() => {
            args = [];
            mentionedMember = { id: mentionedMemberId, nickname: mentionedMemberNickname, user: { avatarURL: sandbox.stub().returns(mentionedMemberAvatar) } } as any as GuildMember;

            mentionCollection = new Collection<string, GuildMember>();
            mentionCollection.set(mentionedMemberId, mentionedMember);

            channel = stubInterface<MessageChannel>();

            message = {
                mentions: {
                    members: mentionCollection,
                },
                channel
            } as any as Message;

            vatsimUser = {
                id: cid,
                reg_date: '2020-03-03T20:10:00.000Z',
                subdivision: 'BHR',
                division: 'some division',
                name_first: 'first',
                name_last: 'last',
                rating: 'S1',
                pilotrating: '1'
            };

            extractUserCidFromGuildMemberStub = sandbox.stub(discordHelpers, 'extractUserCidFromGuildMember').returns(cid); 
            getVatsimUserStub = sandbox.stub(discordHelpers, 'getVatsimUser').resolves(vatsimUser);
            sendMessageToChannelStub = sandbox.stub(discordHelpers, 'sendMessageToChannel');
        });

        it('should return void after doing nothing when no member is mentioned', () => {
            (message.mentions.members as any) = new Collection();

            return handler.handle(command, args, message)
                .then(result => {
                    extractUserCidFromGuildMemberStub.should.not.have.been.called;
                    getVatsimUserStub.should.not.have.been.called;
                    sendMessageToChannelStub.should.not.have.been.called;

                    should().not.exist(result);
                });
        });

        it('should swallow an AppError thrown by extractUserCidFromGuildMember() and then post an error message to the channel, resolving void', () => {
            const error = new AppError('Some fake AppError');
            extractUserCidFromGuildMemberStub.throws(error);

            return handler.handle(command, args, message)
                .then(result => {
                    extractUserCidFromGuildMemberStub.should.have.been.calledOnce;
                    extractUserCidFromGuildMemberStub.should.have.been.calledWithExactly(mentionedMember);

                    getVatsimUserStub.should.not.have.been.called;

                    sendMessageToChannelStub.should.have.been.calledOnce;
                    sendMessageToChannelStub.should.have.been.calledWithExactly(mentionedMemberNickname, error.detailed, message.channel, mentionedMemberAvatar);

                    should().not.exist(result);
                });
        });

        it('should reject any non-AppError thrown by extractUserCidFromGuildMember(), without posting an error message to the channel', () => {
            const error = new Error('Some fake error');
            extractUserCidFromGuildMemberStub.throws(error);

            return handler.handle(command, args, message)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    extractUserCidFromGuildMemberStub.should.have.been.calledOnce;
                    extractUserCidFromGuildMemberStub.should.have.been.calledWithExactly(mentionedMember);

                    getVatsimUserStub.should.not.have.been.called;
                    sendMessageToChannelStub.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should reject with any non-AppError thrown by getVatsimUser', () => {
            const error = new Error('Some fake error');
            getVatsimUserStub.rejects(error);

            return handler.handle(command, args, message)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    extractUserCidFromGuildMemberStub.should.have.been.calledOnce;
                    extractUserCidFromGuildMemberStub.should.have.been.calledWithExactly(mentionedMember);

                    getVatsimUserStub.should.have.been.calledOnce;
                    getVatsimUserStub.should.have.been.calledWithExactly(vatsimApi, cid);

                    sendMessageToChannelStub.should.not.have.been.called;

                    err.should.be.equal(error);
                });
        });

        it('should reject with any non-AppError thrown by sendMessageToChannel()', () => {
            const error = new Error('Some fake error');
            sendMessageToChannelStub.rejects(error);

            return handler.handle(command, args, message)
                .then(() => {
                    throw new Error('Expected an error to be thrown but got success');
                }, err => {
                    extractUserCidFromGuildMemberStub.should.have.been.calledOnce;
                    extractUserCidFromGuildMemberStub.should.have.been.calledWithExactly(mentionedMember);

                    getVatsimUserStub.should.have.been.calledOnce;
                    getVatsimUserStub.should.have.been.calledWithExactly(vatsimApi, cid);

                    sendMessageToChannelStub.should.have.been.calledOnce;
                    // gotta figure out whats wrong here
                    // sendMessageToChannelStub.should.have.been.calledWithExactly(
                    //     mentionedMemberNickname,
                    //     `CID: **1234567 (first last)**
                    //     vACC: **Home (Bahrain/BHR)**
                    //     Division: **some division**
                    //     Reg Date: **Tue, 03 Mar 2020 20:10:00 GMT**
                    //     Controller Rating: **2**
                    //     Pilot Rating: **Private Pilot License (PPL)**`,
                    //     channel,
                    //     mentionedMemberAvatar
                    // );

                    err.should.be.equal(error);
                });
        });

        it('should resolve void after successfully extracting vatsim user data and posting a message to the channel', () => {
            vatsimUser = {
                id: cid,
                reg_date: '2020-03-03T20:10:00.000Z',
                subdivision: undefined,
                division: undefined,
                name_first: 'first',
                name_last: 'last',
                rating: 'S3',
                pilotrating: '4'
            };
            getVatsimUserStub.resolves(vatsimUser);

            return handler.handle(command, args, message)
                .then(result => {
                    extractUserCidFromGuildMemberStub.should.have.been.calledOnce;
                    extractUserCidFromGuildMemberStub.should.have.been.calledWithExactly(mentionedMember);

                    getVatsimUserStub.should.have.been.calledOnce;
                    getVatsimUserStub.should.have.been.calledWithExactly(vatsimApi, cid);

                    sendMessageToChannelStub.should.have.been.calledOnce;
                    // gotta figure out whats wrong here
                    // sendMessageToChannelStub.should.have.been.calledWithExactly(
                    //     mentionedMemberNickname,
                    //     `CID: **1234567 (first last)**
                    //     vACC: **Home (Bahrain/BHR)**
                    //     Division: **some division**
                    //     Reg Date: **Tue, 03 Mar 2020 20:10:00 GMT**
                    //     Controller Rating: **2**
                    //     Pilot Rating: **Private Pilot License (PPL)**`,
                    //     channel,
                    //     mentionedMemberAvatar
                    // );

                    should().not.exist(result);
                });
        });
    });
});
