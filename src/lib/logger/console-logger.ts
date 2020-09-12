import { Logger, LogLevelValue, LogLevel } from './types';

export class ConsoleLogger implements Logger {
    constructor(private readonly state: LogLevelValue) { }

    log(message: string, level: LogLevel): this {
        if (LogLevelValue[level] >= this.state) {
            console.log(`${new Date().toISOString()}  ${level} >> ${message}`);
        }

        return this;
    }

    fatal(message: string): this {
        return this.log(message, LogLevel.FATAL);
    }

    error(message: string): this {
        return this.log(message, LogLevel.ERROR);
    }

    warn(message: string): this {
        return this.log(message, LogLevel.WARN);
    }

    info(message: string): this {
        return this.log(message, LogLevel.INFO);
    }

    debug(message: string): this {
        return this.log(message, LogLevel.DEBUG);
    }

    verbose(message: string): this {
        return this.log(message, LogLevel.VERBOSE);
    }
}
