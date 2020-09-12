import { EventListener } from '../models';

export interface EventHandler {
    supported(...args: any[]): boolean;
    handle: EventListener;
}
