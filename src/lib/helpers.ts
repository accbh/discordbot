export function jsonReviver(key: string , value: any): any {
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
