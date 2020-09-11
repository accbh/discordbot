export interface EventHandler {
    supported(messageReaction, user): boolean;
    handle(): Promise<void>;
}
