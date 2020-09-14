import { EventListener } from '../types';

export interface EventHandler {
    supported(...args: any[]): boolean;
    handle: EventListener;
}
