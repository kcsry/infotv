import { forceInt } from "./utils";

function random(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function noop() {
    return;
}

export interface StaggerOptions {
    autostart: boolean;
    context: any;
    arguments: [];
    callback: () => void;
    min: number;
    max: number;
}

export default class Stagger {
    public static DEFAULT_OPTIONS: StaggerOptions = {
        autostart: true,
        context: null,
        arguments: [],
        callback: noop,
        min: 0,
        max: 0,
    };

    private readonly options: StaggerOptions;
    private timer?: number;

    constructor(initialOptions: Partial<StaggerOptions> = {}) {
        const options: StaggerOptions = { ...Stagger.DEFAULT_OPTIONS, ...initialOptions };
        options.min = forceInt(options.min);
        options.max = forceInt(options.max);
        if (options.min < 0 || options.max < 0 || options.max < options.min) {
            throw new Error(`Invalid interval: ${options.min}..${options.max}`);
        }
        this.options = options;
        if (this.options.autostart) {
            this.start();
        }
    }

    public start() {
        this.stop();
        const timeout = Math.floor(random(this.options.min, this.options.max));
        if (timeout <= 0) {
            throw new Error("Invalid timeout");
        }
        this.timer = window.setTimeout(() => {
            this.start();
            this.options.callback.apply(this.options.context, this.options.arguments);
        }, timeout);
    }

    public stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
}
