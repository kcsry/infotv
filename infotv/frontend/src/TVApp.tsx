import React from 'react';
import QS from 'query-string';
import debounce from 'lodash/debounce';
import findIndex from 'lodash/findIndex';
import SlidesComponent from './SlidesComponent';
import OverlayComponent from './OverlayComponent';
import EditorComponent from './EditorComponent';
import datumManager from './DatumManager';
import Stagger from './Stagger';
import fetchJSON from './fetchJSON';
import {forceInt} from './utils';
import { Config, Deck, Slide, TVData } from './types';

function checkTallness() {
    document.body.classList.toggle('tall', window.innerWidth < window.innerHeight);
}

interface TVAppState {
    ticksUntilNextSlide: number;
    slideIndex: number;
    data: TVData;
    currentDeckName: string;
    id: number;
    edit: boolean;
}

interface TVAppProps {
    config: Config;
}


export default class TVApp extends React.Component<TVAppProps, TVAppState> {
    private deckUpdater?: Stagger;
    private scheduleUpdater?: Stagger;
    private socialUpdater?: Stagger;
    public state: TVAppState;
    private slideSwitchTimer?: number;
    private madokaTimer?: number;

    constructor(props: TVAppProps) {
        super(props);
        const {config} = props;
        this.state = {
            data: {decks: {}},
            currentDeckName: config.deck ? config.deck.toLowerCase() : 'default',
            id: -1,
            slideIndex: 0,
            ticksUntilNextSlide: 1,
            edit: false,
        };
    }

    public UNSAFE_componentWillMount() {
        const {config} = this.props;
        this.deckUpdater = new Stagger({
            min: 50 * 1000,
            max: 70 * 1000,
            callback: this.requestDeck,
        });
        this.scheduleUpdater = new Stagger({
            min: 60 * 4 * 1000,
            max: 60 * 6 * 1000,
            callback: this.requestSchedule,
        });
        this.socialUpdater = new Stagger({
            min: 50 * 1000,
            max: 90 * 1000,
            callback: this.requestSocial,
        });
        this.slideSwitchTimer = window.setInterval(this.slideSwitchTick, 3500);
        this.madokaTimer = window.setInterval(this.madokaTick, 10000);
        this.requestDeck();
        this.requestSchedule();
        this.requestSocial();
        if (config.edit) {
            this.enableEditing();
        } else {
            document.body.classList.add('show');
        }
        window.addEventListener('resize', debounce(checkTallness, 200));
        checkTallness();
    }

    public componentWillUnmount() {
        if (this.deckUpdater) {
            this.deckUpdater.stop();
        }
        if (this.scheduleUpdater) {
            this.scheduleUpdater.stop();
        }
        if (this.socialUpdater) {
            this.socialUpdater.stop();
        }
        clearInterval(this.madokaTimer);
        clearInterval(this.slideSwitchTimer);
    }

    public getDeck = (): Deck => {
        const {data} = this.state;
        if (!data.decks) {
            // Data has not been loaded yet
            return [];
        }
        // Fallback to default deck if preferred deck is not available
        const requestedDeckName = this.state.currentDeckName || 'default';
        return data.decks[requestedDeckName] || [];
    };

    private slideSwitchTick = () => {
        if (this.state.edit) {
            return false;
        }
        const ticks = this.state.ticksUntilNextSlide - 1;
        this.setState({ticksUntilNextSlide: ticks});
        if (ticks <= 0) {
            this.nextSlide();
        }
        return true;
    };

    private nextSlide = () => {
        let ticksUntilNextSlide = 1;
        let newSlideIndex = this.state.slideIndex;
        const deck = this.getDeck();
        for (let offset = 1; offset < 30; offset++) {
            newSlideIndex = Math.max(0, this.state.slideIndex + offset) % deck.length;
            const newSlide = deck[newSlideIndex];
            if (newSlide) {
                if (forceInt(newSlide.duration) <= 0) {
                    // skip zero-duration slides
                    continue;
                }
                ticksUntilNextSlide = newSlide.duration;
                break;
            }
        }
        this.setState({slideIndex: newSlideIndex, ticksUntilNextSlide});
    };

    public viewSlideById = (id: string) => {
        const index = findIndex(this.getDeck(), (s) => s.id === id);
        if (index > -1) {
            this.setState({slideIndex: index});
            console.log('Viewing slide:', index, 'id', id);
        }
    };

    public addNewSlide = () => {
        const slide = {type: 'text', duration: 1, id: `s${Date.now().toString(30)}`};
        const deck = this.getDeck();
        deck.splice(this.state.slideIndex, 0, slide);
        const {data} = this.state;
        this.setState({data});
        this.viewSlideById(slide.id);
    };

    public deleteCurrentSlide = () => {
        const deck = this.getDeck();
        deck.splice(this.state.slideIndex, 1);
        const {data} = this.state;
        this.setState({data, slideIndex: 0});
    };

    public addNewDeck = (newDeckName: string) => {
        const {data} = this.state;
        if (!newDeckName || newDeckName.length <= 0 || data.decks[newDeckName]) {
            alert('Pakalta puuttuu nimi tai se on jo olemassa.');
            return;
        }
        data.decks[newDeckName] = [];
        this.setState({data, currentDeckName: newDeckName, slideIndex: 0}, () => {
            this.addNewSlide();
        });
    };

    public deleteCurrentDeck = () => {
        if (this.state.currentDeckName === 'default') {
            alert('Default-pakkaa ei voi poistaa.');
            return;
        }
        const {data} = this.state;
        delete data.decks[this.state.currentDeckName];
        this.setState({data});
    };

    public changeDeck = (newDeckName: string) => {
        this.setState({currentDeckName: newDeckName, slideIndex: 0});
    };

    private requestDeck = () => {
        // When in edit mode, prevent auto-update
        if (this.state.edit) {
            return false;
        }
        fetchJSON(`${location.pathname}?${QS.stringify({action: 'get_deck'})}`).then(
            ({id, data, datums}) => {
                if (
                    !this.state.data ||
                    !this.state.data.decks ||
                    this.state.id !== id
                ) {
                    console.log('new decks', data);
                    this.setState({data, id, slideIndex: -1});
                    this.nextSlide();
                }
                datumManager.update(datums || {});
            },
        );
        return true;
    };

    private requestSchedule = () => {
        const {config} = this.props;
        fetchJSON(`/api/schedule/json2/?${QS.stringify({event: config.event})}`).then((data) => {
            datumManager.setValue('schedule', data);
            this.forceUpdate();
        });
    };

    private requestSocial = () => {
        fetchJSON('/api/social/').then((data) => {
            datumManager.setValue('social', data);
            this.forceUpdate();
        });
    };

    private madokaTick = () => {
        const shouldMadoka = new Date().getHours() < 1 && Math.random() < 0.1;
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.classList.toggle('madoka', shouldMadoka);
        }
    };

    public enableEditing() {
        this.setState({edit: true});
        return true;
    }

    public render() {
        let currentSlide: Slide | undefined;
        const {config} = this.props;
        const deck = this.getDeck();
        if (config.only) {
            currentSlide = {type: config.only, id: 'only', duration: Number.MAX_SAFE_INTEGER};
        } else if (deck) {
            currentSlide = deck[this.state.slideIndex];
        }
        const editor = this.state.edit ? (
            <div id="editor" key="editor">
                <EditorComponent
                    tv={this}
                    config={this.props.config}
                    data={this.state.data}
                    currentDeckName={this.state.currentDeckName}
                    currentSlide={currentSlide}
                />
            </div>
        ) : null;
        const eep = this.state.data.eep ? <div id="eep">{this.state.data.eep}</div> : null;
        const animate = !(this.state.edit || config.slow);
        return (
            <div>
                <div id="content" key="content">
                    <OverlayComponent/>
                    {currentSlide ?
                        <SlidesComponent
                            tv={this}
                            config={this.props.config}
                            currentSlide={currentSlide}
                            animate={animate}
                        /> : null
                    }
                </div>
                {eep}
                {editor}
            </div>
        );
    }
}
