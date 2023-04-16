export interface Datum<T = any> {
    value: T;
    mtime: number;
    virtual?: boolean;
}

const datums: Record<string, Datum> = {};

export class DatumManager {
    public update(data: Record<string, Datum>) {
        Object.assign(datums, data);
    }

    public setValue<T = any>(key: string, value: T): Datum<T> {
        const datum: Datum<T> = { value, mtime: 0, virtual: true };
        datums[key] = datum;
        return datum;
    }

    public getValue<T = any>(key: string, defaultValue?: T): T {
        const datum = datums[key];
        if (datum) {
            return datum.value as T;
        }
        return defaultValue as T;
    }

    public getFull<T = any>(key: string): Datum<T> | undefined {
        return datums[key] || undefined;
    }
}

const instance = new DatumManager();

export default instance;
