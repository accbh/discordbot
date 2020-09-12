export enum LogLevel {
    VERBOSE = 'VERBOSE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
}

export enum LogLevelValue {
    VERBOSE = 0,
    DEBUG = 10,
    INFO = 40,
    WARN = 60,
    ERROR = 80,
    FATAL = 100,
}

export interface Logger {
    log(message: string, level: LogLevel): this;
    fatal(message: string): this;
    error(message: string): this;
    warn(message: string): this;
    info(message: string): this;
    debug(message: string): this;
    verbose(message: string): this;
}
