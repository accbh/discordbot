/*

    Name: logger.ts
    Version: 0.0.1
    Author: Liam P, Gavin v. G
    Date: 21/07/2020
    Description: Logger.

*/

//import { MessageEmbed } from "discord.js";

export enum LogLevel {

    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
    VERBOSE = 'VERBOSE'

}

export enum LogLevelValue {

    INFO = 0,
    WARN = 10,
    ERROR = 20,
    FATAL = 30,
    VERBOSE = 100

}

export interface Logger {

    log(message: string, level: LogLevel): this;

}

export class ConsoleLogger implements Logger {

    constructor(private readonly state: LogLevelValue) {
        
    }

    log(message: string, level: LogLevel): this {

        if (LogLevelValue[level] >= this.state) {

            console.log(`${new Date().toISOString()}  ${level} >> ${message}`);

        }

        return this;

    }

    submitTraining(cid: string, date: Date, note: string, level: LogLevel): this { //It's just going to get the info and log to a specific channel
        if (LogLevelValue[level] >= this.state) {
            //const embed = new MessageEmbed()

            //console.log(`${new Date().toISOString()}  ${level} >> ${message}`);

        }

        return this;
    }

}

// const logger = new ConsoleLogger(LogLevelValue.INFO);
// logger.log("Hello", LogLevel.ERROR)
