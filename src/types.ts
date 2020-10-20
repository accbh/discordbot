import { ClientEvents, Message, User, GuildMember, Role } from 'discord.js';

export type EventListener = (...args: any[]) => void | Promise<void>;

export interface Hook {
    name: keyof ClientEvents;
    listener: EventListener;
}

export enum ATCRatings {
    SUSPENDED,
    OBSERVER,
    S1,
    S2,
    S3,
    C1,
    C2,
    C3,
    I1,
    I2,
    I3,
    SUPERVISOR,
    ADMINISTRATOR
}

export enum PilotRatings {
    P0 = 'Basic VATSIM Pilot',
    P1 = 'Private Pilot License (PPL)',
    P2 = 'Instrument Rating (IR)',
    P3 = 'Commerical Multi-Engine License (CMEL)',
    P4 = 'Airline Transport License (ATPL)'
}

export type ExtractedMessageProps = { member: GuildMember, role: Role };
export type ExtractedMessagePropsFn = (message: Message, user: User, roleName: string) => ExtractedMessageProps;
