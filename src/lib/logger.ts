/*

    Name: logger.ts
    Version: 0.0.1
    Author: Liam P, Gavin v. G
    Date: 21/07/2020
    Description: Logger.

*/

//import { MessageEmbed } from "discord.js";

export enum LogLevel {
    VERBOSE = 'VERBOSE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
}

export enum LogLevelValue {
    VERBOSE = -100,
    DEBUG = -10,
    INFO = 0,
    WARN = 10,
    ERROR = 20,
    FATAL = 30,
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
