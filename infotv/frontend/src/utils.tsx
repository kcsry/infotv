export function isImageURL(url?: string): boolean {
    return /^http.+(jpg|gif|png|svg|jpeg)$/i.test(url || "");
}

export function forceInt(val: any): number {
    if (!val) {
        return 0;
    }
    if (typeof val === "number") {
        return Math.floor(val);
    }
    return parseInt(`${val}`, 10);
}
