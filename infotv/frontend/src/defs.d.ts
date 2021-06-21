import TVApp from "./TVApp";
import { Config } from "./types";

declare global {
    interface Window {
        TV?: TVApp;
        Options?: Partial<Config>;
    }
}
