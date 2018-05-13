/* eslint-disable no-console */
import React from "react";
import QS from "query-string";
import _ from "lodash";

import SlidesComponent from "./slides.jsx";
import OverlayComponent from "./overlay.jsx";
import EditorComponent from "./editor.jsx";
import DatumManager from "./datum";
import stagger from "./stagger";
import config from "./config";
import { fetchJSON } from "./utils";

function checkTallness() {
    document.body.classList.toggle("tall", window.innerWidth < window.innerHeight);
}

export default class TVApp extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.madokaTick = this.madokaTick.bind(this);
        this.requestDeck = this.requestDeck.bind(this);
        this.requestSchedule = this.requestSchedule.bind(this);
        this.requestSocial = this.requestSocial.bind(this);
        this.slideSwitchTick = this.slideSwitchTick.bind(this);
        this.addNewSlide = this.addNewSlide.bind(this);
        this.deleteCurrentSlide = this.deleteCurrentSlide.bind(this);
        this.getDeck = this.getDeck.bind(this);
        this.addNewDeck = this.addNewDeck.bind(this);
        this.deleteCurrentDeck = this.deleteCurrentDeck.bind(this);
        this.changeDeck = this.changeDeck.bind(this);

        this.state = {
            data: {},
            currentDeckName: config.deck ? config.deck.toLowerCase() : "default",
            id: -1,
            slideIndex: 0,
            ticksUntilNextSlide: 1,
            edit: false,
        };
    }

    componentWillMount() {
        const self = this;
        this.deckUpdater = stagger({
            interval: [50 * 1000, 70 * 1000],
            callback: self.requestDeck,
        });
        this.scheduleUpdater = stagger({
            interval: [60 * 4 * 1000, 60 * 6 * 1000],
            callback: self.requestSchedule,
        });
        this.socialUpdater = stagger({
            interval: [50 * 1000, 90 * 1000],
            callback: self.requestSocial,
        });
        this.slideSwitchTimer = setInterval(self.slideSwitchTick, 3500);
        this.madokaTimer = setInterval(self.madokaTick, 10000);
        this.requestDeck();
        this.requestSchedule();
        this.requestSocial();
        if (config.edit) this.enableEditing();
        else document.body.classList.add("show");
        window.addEventListener("resize", _.debounce(checkTallness, 200));
        checkTallness();
    }

    componentWillUnmount() {
        this.deckUpdater.stop();
        this.scheduleUpdater.stop();
        this.socialUpdater.stop();
        clearInterval(this.madokaTimer);
        clearInterval(this.slideSwitchTimer);
    }

    getDeck() {
        if (!this.state.data.hasOwnProperty("decks")) {
            // Data has not been loaded yet
            return [];
        }
        if (!this.state.currentDeckName || !this.state.data.decks.hasOwnProperty(this.state.currentDeckName)) {
            // Fallback to default deck if preferred deck is not available
            return this.state.data.decks.default;
        }
        return this.state.data.decks[this.state.currentDeckName];
    }

    slideSwitchTick() {
        if (this.state.edit) return false;
        const ticks = this.state.ticksUntilNextSlide - 1;
        this.setState({ ticksUntilNextSlide: ticks });
        if (ticks <= 0) {
            this.nextSlide();
        }
        return true;
    }

    nextSlide() {
        let ticksUntilNextSlide = 1;
        let newSlideIndex = null;
        const deck = this.getDeck();
        for (let offset = 1; offset < 30; offset++) {
            newSlideIndex = Math.max(0, this.state.slideIndex + offset) % deck.length;
            const newSlide = deck[newSlideIndex];

            if (newSlide) {
                // eslint-disable-next-line no-bitwise
                if ((0 | newSlide.duration) <= 0) {
                    // skip zero-duration slides
                    // eslint-disable-next-line no-continue
                    continue;
                }
                ticksUntilNextSlide = newSlide.duration;
                break;
            }
        }
        this.setState({ slideIndex: newSlideIndex, ticksUntilNextSlide });
    }

    viewSlideById(id) {
        const index = _.findIndex(this.getDeck(), (s) => s.id === id);
        if (index > -1) {
            this.setState({ slideIndex: index });
            console.log("Viewing slide:", index, "id", id);
        }
    }

    addNewSlide() {
        const slide = { type: "text", duration: 1, id: `s${Date.now().toString(30)}` };
        const deck = this.getDeck();
        deck.splice(this.state.slideIndex, 0, slide);
        const { data } = this.state;
        this.setState({ data });
        this.viewSlideById(slide.id);
    }

    deleteCurrentSlide() {
        const deck = this.getDeck();
        deck.splice(this.state.slideIndex, 1);
        const { data } = this.state;
        this.setState({ data, slideIndex: 0 });
    }

    addNewDeck(newDeckName) {
        const { data } = this.state;
        if (!newDeckName || newDeckName.length <= 0 || data.decks.hasOwnProperty(newDeckName)) {
            alert("Pakalta puuttuu nimi tai se on jo olemassa.");
            return;
        }
        data.decks[newDeckName] = [];
        this.setState({ data, currentDeckName: newDeckName, slideIndex: 0 }, () => {
            this.addNewSlide();
        });
    }

    deleteCurrentDeck() {
        if (this.state.currentDeckName === "default") {
            alert("Default-pakkaa ei voi poistaa.");
            return;
        }
        const { data } = this.state;
        delete data.decks[this.state.currentDeckName];
        this.setState({ data });
    }

    changeDeck(newDeckName) {
        this.setState({ currentDeckName: newDeckName, slideIndex: 0 });
    }

    requestDeck() {
        if (this.state.edit) return false; // When in edit mode, prevent auto-update
        // eslint-disable-next-line no-restricted-globals
        fetchJSON(`${location.pathname}?${QS.stringify({ action: "get_deck" })}`).then(
            ({ id, data, datums }) => {
                if (!this.state.data || !this.state.data.hasOwnProperty("decks") || this.state.id !== id) {
                    console.log("new decks", data);
                    this.setState({ data, id, slideIndex: -1 });
                    this.nextSlide();
                }
                DatumManager.update(datums || {});
            }
        );

        return true;
    }

    requestSchedule() {
        fetchJSON(`/api/schedule/json2/?${QS.stringify({ event: config.event })}`).then((data) => {
            DatumManager.setValue("schedule", data);
            this.forceUpdate();
        });
    }

    requestSocial() {
        fetchJSON("/api/social/").then((data) => {
            DatumManager.setValue("social", data);
            this.forceUpdate();
        });
    }

    // eslint-disable-next-line class-methods-use-this
    madokaTick() {
        const shouldMadoka = new Date().getHours() < 1 && Math.random() < 0.1;
        document.getElementById("content").classList.toggle("madoka", shouldMadoka);
    }

    enableEditing() {
        this.setState({ edit: true });
        return true;
    }

    render() {
        let currentSlide = null;
        const deck = this.getDeck();
        if (config.only) {
            currentSlide = { type: config.only, id: "only" };
        } else if (deck) {
            currentSlide = deck[this.state.slideIndex];
        }
        const editor = this.state.edit ? (
            <div id="editor" key="editor">
                <EditorComponent tv={this} data={this.state.data} currentDeckName={this.state.currentDeckName} currentSlide={currentSlide} />
            </div>
        ) : null;
        const eep =
            this.state.data.eep ? (
                <div id="eep">{this.state.data.eep}</div>
            ) : null;
        const animate = !(this.state.edit || config.slow);
        return (
            <div>
                <div id="content" key="content">
                    <OverlayComponent />
                    <SlidesComponent tv={this} currentSlide={currentSlide} animate={animate} />
                </div>
                {eep}
                {editor}
            </div>
        );
    }
}
