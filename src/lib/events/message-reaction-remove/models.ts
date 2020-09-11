export interface EventHandler {
    supported(messageReaction, user): boolean;
    handle(messageReaction, user): Promise<void>;
}
