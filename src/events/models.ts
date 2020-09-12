export interface EventHandler {
    supported(...args: any[]): boolean;
    handle(...args: any[]): Promise<void>;
}
