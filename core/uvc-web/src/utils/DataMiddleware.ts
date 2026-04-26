export const deepCopy = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Array) {
        const copy = [] as unknown[];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy.map(item => deepCopy(item)) as unknown as T;
    }

    if (obj instanceof Object) {
        const copy = {} as { [key: string]: unknown };
        for (const attr in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy as T;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}