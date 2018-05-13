/* eslint-disable no-restricted-globals */
import React from "react";
import _ from "lodash";
import propTypes from "./prop-types";
import { fetchJSON } from "./utils";

const editorComponents = require("./s").default.editors;

export default class EditorComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.confirmAndPublish = this.confirmAndPublish.bind(this);
        this.eepChanged = this.eepChanged.bind(this);
        this.moveSlideDown = this.moveSlideDown.bind(this);
        this.moveSlideUp = this.moveSlideUp.bind(this);
        this.slideChanged = this.slideChanged.bind(this);
        this.slideDurationChanged = this.slideDurationChanged.bind(this);
        this.slideTypeChanged = this.slideTypeChanged.bind(this);
        this.deckChanged = this.deckChanged.bind(this);
        this.addNewDeck = this.addNewDeck.bind(this);
        this.deleteDeck = this.deleteDeck.bind(this);
    }

    getSlideEditor(currentSlide) {
        const editorComponentClass = editorComponents[currentSlide.type];
        const editorComponent = editorComponentClass
            ? editorComponentClass({ slide: currentSlide, editor: this, tv: this.props.tv })
            : `no editor for ${currentSlide.type}`;
        const slideTypeOptions = _.keys(editorComponents).map((t) => (
            <option key={t} value={t}>
                {t}
            </option>
        ));
        const slideTypeSelect = (
            <select key="slide-type" value={currentSlide.type} onChange={this.slideTypeChanged}>
                {slideTypeOptions}
            </select>
        );
        const slideDurationInput = (
            <input
                type="number"
                value={currentSlide.duration}
                min="0"
                max="10"
                onChange={this.slideDurationChanged}
            />
        );

        return (
            <div className="slide-editor">
                <div className="toolbar">
                    <button onClick={this.props.tv.deleteCurrentSlide}>Poista</button>
                    <button onClick={this.moveSlideUp}>Siirrä ylös</button>
                    <button onClick={this.moveSlideDown}>Siirrä alas</button>
                </div>
                <div className="toolbar">
                    <label>Sliden tyyppi: {slideTypeSelect}</label>
                    <label>Sliden kesto: {slideDurationInput}&times;</label>
                </div>
                {editorComponent}
            </div>
        );
    }

    eepChanged(event) {
        const eep = event.target.value;
        this.props.data.eep = eep && eep.length ? eep : null;
        this.props.tv.forceUpdate();
    }

    slideChanged(event) {
        const id = event.target.value;
        this.props.tv.viewSlideById(id);
    }

    slideTypeChanged(event) {
        this.props.currentSlide.type = event.target.value;
        this.props.tv.forceUpdate();
    }

    moveSlide(slide_, direction) {
        const slides = this.props.tv.getDeck();
        const idx = slides.indexOf(slide_);
        if (idx === -1) return;
        const slide = slides.splice(idx, 1)[0];
        let newIdx = idx + direction;
        if (newIdx < 0) newIdx = 0;
        if (newIdx >= slides.length) newIdx = slides.length;
        slides.splice(newIdx, 0, slide);
    }

    moveSlideUp() {
        this.moveSlide(this.props.currentSlide, -1);
        this.props.tv.viewSlideById(this.props.currentSlide.id);
    }

    moveSlideDown() {
        this.moveSlide(this.props.currentSlide, +1);
        this.props.tv.viewSlideById(this.props.currentSlide.id);
    }

    slideDurationChanged(event) {
        this.props.currentSlide.duration = parseInt(event.target.value, 10);
        this.props.tv.forceUpdate();
    }

    confirmAndPublish() {
        if (this.props.data.decks.default.length <= 0) {
            alert("Ei voi julkaista tyhjää Default-pakkaa");
            return false;
        }
        if (!confirm("Oletko varma että haluat julkaista nykyisen pakan?")) {
            return false;
        }

        const deckFormData = new FormData();
        deckFormData.append("action", "post_deck");
        deckFormData.append("data", JSON.stringify(this.props.data));
        fetchJSON(location.pathname, { method: "POST", body: deckFormData })
            .then((data) => {
                alert(data.message || "wut :(");
            })
            .catch((err) => {
                alert((err.body && err.body.message) || "it broke");
            });

        return true;
    }

    deckChanged(event) {
        this.props.tv.changeDeck(event.target.value);
    }

    addNewDeck() {
        const newDeckName = this.newDeckInput.value.trim().toLowerCase();
        this.props.tv.addNewDeck(newDeckName);
        this.newDeckInput.value = "";
    }

    deleteDeck() {
        this.props.tv.deleteCurrentDeck();
    }

    render() {
        if (!this.props.data || !this.props.data.hasOwnProperty("decks")) {
            return <div>Missing decks :(</div>;
        }
        const deckOptions = Object.keys(this.props.data.decks).map((name) => <option key={name} value={name}>{name}</option>);

        const slides = this.props.tv.getDeck();
        const slideOptions = slides.map((s, i) => {
            let text = `Slide ${i + 1} (${s.type}) `;
            if (s.type === "text") {
                let contentTrim = s.content || "";
                if (contentTrim.length > 15) {
                    contentTrim = `${contentTrim.substr(0, 15)}...`;
                }
                text += `"${contentTrim}"`;
            } else {
                text += `[${s.id}]`;
            }
            if (s.duration <= 0) text += " (ei päällä)";
            return (
                <option key={s.id} value={s.id}>
                    {text}
                </option>
            );
        });
        const { currentSlide } = this.props;
        let slideEditor = null;
        if (currentSlide) {
            slideEditor = this.getSlideEditor(currentSlide);
        }
        return (
            <div>
                <div className="editor-toolbar toolbar">
                    <button onClick={this.confirmAndPublish}>Julkaise muutokset</button>
                </div>
                <div className="eep-editor toolbar">
                    <label htmlFor="eep-input">Erikoisviesti:&nbsp;</label>
                    <input
                        value={this.props.data.eep || ""}
                        onChange={this.eepChanged}
                        id="eep-input"
                    />
                </div>
                <div className="toolbar-header">
                    Pakka
                </div>
                <div className="deck-selector toolbar">
                    <select value={this.props.currentDeckName ? this.props.currentDeckName : ""} onChange={this.deckChanged} id="editor-select-deck">{deckOptions}</select>
                </div>
                <div className="deck-creator toolbar">
                    <label>Nimi: <input ref={input => { this.newDeckInput = input; }} id="new-deck-name" /></label>
                    <button onClick={this.addNewDeck}>Uusi pakka</button>
                    <button onClick={this.deleteDeck} disabled={!this.props.currentDeckName}>Poista</button>
                </div>
                <div className="toolbar-header">
                    Slide
                </div>
                <div className="slide-selector toolbar">
                    <select
                        value={currentSlide ? currentSlide.id : ""}
                        onChange={this.slideChanged}
                        id="editor-select-slide"
                    >
                        {slideOptions}
                    </select>
                    <button onClick={this.props.tv.addNewSlide}>Uusi slide</button>
                </div>
                <div className="slide-editor-ctr">{slideEditor}</div>
            </div>
        );
    }
}

EditorComponent.propTypes = {
    data: propTypes.data.isRequired,
    tv: propTypes.tv.isRequired,
    currentDeckName: propTypes.deckName,
    currentSlide: propTypes.slide,
};
