import BlueBirdRetry from 'bluebird-retry';

export function jsonReviver(key: string, value: any): any {
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
            return new Date(value);
        }

        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
            return new Date(`${value}.000Z`);
        }
    }

    return value;
}

export function jsonParser(value: string, reviver?: (key: string, value: any) => any): any {
    return JSON.parse(value, reviver || jsonReviver);
}

export async function defaultRetry<T = any>(func: () => T | Promise<T>): Promise<T> {
    return factory.retry<T>(func, { max_tries: 5, interval: 25, backoff: 2 });
}

export async function retry<T = any>(func: () => T | Promise<T>, options: BlueBirdRetry.Options): Promise<T> {
    return BlueBirdRetry<T>(func, { throw_original: true, ...options });
}

// https://stackoverflow.com/questions/39861674/stubbing-method-in-same-file-using-sinon
export const factory = {
    defaultRetry,
    retry
};
