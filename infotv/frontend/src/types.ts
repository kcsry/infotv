export interface Config {
    deck: string;
    edit: boolean;
    only?: string;
    slow: boolean;
    event: string;
    loc?: string; // for only=nownext
}

export interface Slide {
    id: string;
    type: string;
    duration: number;
    scheduleBegin?: Date;
    scheduleEnd?: Date;
}

export type Deck = Slide[];

export interface TVData {
    eep?: any; // TODO: Type me
    decks: { [deckName: string]: Deck };
}
