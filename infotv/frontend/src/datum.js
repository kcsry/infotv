import _ from "lodash";

let datums = {};

export default {
    update(data) {
        datums = _.extend(datums, data);
    },
    setValue(key, value) {
        const datum = { value, mtime: 0, virtual: true };
        datums[key] = datum;
        return datum;
    },
    getValue(key, defaultValue) {
        const datum = datums[key];
        if (datum) {
            return datum.value;
        }
        return defaultValue;
    },
    getFull(key) {
        return datums[key] || undefined;
    },
};
