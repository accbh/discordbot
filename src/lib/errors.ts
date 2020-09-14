export class AppError extends Error {
    constructor(detailed: string, message: string = 'An unexpected error occurred.') {
        super(message);
        this.detailed = detailed || message;
        this.name = this.constructor.name;
        if (AppError.supportsCaptureStackTrace()) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
    }

    /**
     * The original detailed error message, use this to prevent unwanted
     * data leaks to the user/client, but still capture error information
     */
    detailed: string;

    /**
     * The name of the error instance
     */
    name: string;

    static supportsCaptureStackTrace(): boolean {
        return typeof Error.captureStackTrace === 'function';
    }
}
