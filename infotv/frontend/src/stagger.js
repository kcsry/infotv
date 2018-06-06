/* eslint-disable no-bitwise */
import _ from "lodash";

function forceInt(val) {
    return parseInt(`${val}`, 10);
}

function random(min, max) {
    return min + Math.random() * (max - min);
}

function Stagger(initialOptions) {
    const options = _.extend(
        {
            autostart: true,
            context: null,
            arguments: [],
            callback: () => {},
        },
        initialOptions
    );
    const ival = options.interval;
    if (ival) {
        const [min, max] = ival;
        options.min = min;
        options.max = max;
    }
    options.min = forceInt(options.min);
    options.max = forceInt(options.max);
    if (options.min < 0 || options.max < 0 || options.max < options.min) {
        throw new Error(`Invalid interval: ${options.min}..${options.max}`);
    }
    this.options = options;
    this.timer = null;
    if (this.options.autostart) this.start();
}

Stagger.prototype.start = function start() {
    this.stop();
    const timeout = Math.floor(random(this.options.min, this.options.max));
    if (timeout <= 0) throw new Error("Invalid timeout");
    this.timer = setTimeout(() => {
        this.start();
        this.options.callback.apply(this.options.context, this.options.arguments);
    }, timeout);
};

Stagger.prototype.stop = function stop() {
    if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
    }
};

export default function(options) {
    return new Stagger(options);
}
