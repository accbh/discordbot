/*
describe('extractMessageProps', () => {
        it('should return an object as expected', () => {
            const userId = 'some-user-id';
            
            const member: GuildMember = {} as GuildMember;
            const role: Role = { name: roleName } as Role;

            const message: Message = {
                guild: {
                    member: sandbox.stub().returns(member),
                    roles: {
                        cache: [role]
                    }
                }
            } as any as Message;
            const user: User = { id: userId } as User;

            const result = handler.extractMessageProps(message, user, roleName);

            message.guild.member.should.have.been.calledOnce;
            message.guild.member.should.have.been.calledWithExactly(userId);

            result.should.be.deep.equal({ member, role });
        });
    });
*/
