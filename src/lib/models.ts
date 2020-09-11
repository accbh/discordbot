import { ClientEvents } from 'discord.js';

export type EventListener = (...args: any[]) => void;

export interface Hook {
    name: keyof ClientEvents;
    listener: EventListener;
}