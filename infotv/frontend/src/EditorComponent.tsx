/* eslint-disable no-restricted-globals */
import React from 'react';
import fetchJSON from './fetchJSON';
import slideModules from './s';
import {Config, Slide, TVData} from './types';
import TVApp from './TVApp';

interface EditorComponentProps {
    data: TVData;
    tv: TVApp;
    config: Config;
    currentDeckName: string;
    currentSlide?: Slide;
}

export default class EditorComponent extends React.Component<EditorComponentProps, {}> {
    private newDeckInputRef: React.RefObject<HTMLInputElement> = React.createRef();

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

    public getSlideEditor(currentSlide) {
        const slideModule = slideModules[currentSlide.type];
        let editorComponent: React.ReactElement<any> = (<div>No editor for ${currentSlide.type}</div>);
        if (slideModule) {
            editorComponent = React.createElement(
                slideModule.editor!,
                {
                    slide: currentSlide,
                    editor: this,
                    config: this.props.config,
                    tv: this.props.tv,
                },
            );
        }
        const slideTypeOptions = Object.keys(slideModules).map((t) => (
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

    public eepChanged(event) {
        const eep = event.target.value;
        this.props.data.eep = eep && eep.length ? eep : null;
        this.props.tv.forceUpdate();
    }

    public slideChanged(event) {
        const id = event.target.value;
        this.props.tv.viewSlideById(id);
    }

    public slideTypeChanged(event) {
        this.props.currentSlide!.type = event.target.value;
        this.props.tv.forceUpdate();
    }

    public moveSlide(slide: Slide, direction) {
        const slides = this.props.tv.getDeck();
        const idx = slides.indexOf(slide);
        if (idx === -1) {
            return;
        }
        slides.splice(idx, 1);
        let newIdx = idx + direction;
        if (newIdx < 0) {
            newIdx = 0;
        }
        if (newIdx >= slides.length) {
            newIdx = slides.length;
        }
        slides.splice(newIdx, 0, slide);
    }

    public moveSlideUp() {
        this.moveSlide(this.props.currentSlide!, -1);
        this.props.tv.viewSlideById(this.props.currentSlide!.id);
    }

    public moveSlideDown() {
        this.moveSlide(this.props.currentSlide!, +1);
        this.props.tv.viewSlideById(this.props.currentSlide!.id);
    }

    public slideDurationChanged(event) {
        this.props.currentSlide!.duration = parseInt(event.target.value, 10);
        this.props.tv.forceUpdate();
    }

    public confirmAndPublish() {
        if (this.props.data.decks.default.length <= 0) {
            alert('Ei voi julkaista tyhjää Default-pakkaa');
            return false;
        }
        if (!confirm('Oletko varma että haluat julkaista nykyisen pakan?')) {
            return false;
        }
        const deckFormData = new FormData();
        deckFormData.append('action', 'post_deck');
        deckFormData.append('data', JSON.stringify(this.props.data));
        fetchJSON(location.pathname, {method: 'POST', body: deckFormData})
            .then((data) => {
                alert(data.message || 'wut :(');
            })
            .catch((err) => {
                alert((err.body && err.body.message) || 'it broke');
            });
        return true;
    }

    public deckChanged(event) {
        this.props.tv.changeDeck(event.target.value);
    }

    public addNewDeck() {
        // TODO: Ahaha, this is shitty and non-Reactful :D
        const newDeckInput = this.newDeckInputRef.current!;
        const newDeckName = newDeckInput.value.trim().toLowerCase();
        this.props.tv.addNewDeck(newDeckName);
        newDeckInput.value = '';
    }

    public deleteDeck() {
        this.props.tv.deleteCurrentDeck();
    }

    public render() {
        if (!this.props.data || !this.props.data.hasOwnProperty('decks')) {
            return <div>Missing decks :(</div>;
        }
        const deckOptions = Object.keys(this.props.data.decks).map((name) => (
            <option key={name} value={name}>
                {name}
            </option>
        ));
        const slides = this.props.tv.getDeck();
        const slideOptions = slides.map((s, i) => {
            let text = `Slide ${i + 1} (${s.type}) `;
            if (s.type === 'text') {
                let contentTrim = (s as any).content || '';  // TODO: remove the any
                if (contentTrim.length > 15) {
                    contentTrim = `${contentTrim.substr(0, 15)}...`;
                }
                text += `"${contentTrim}"`;
            } else {
                text += `[${s.id}]`;
            }
            if (s.duration <= 0) {
                text += ' (ei päällä)';
            }
            return (
                <option key={s.id} value={s.id}>
                    {text}
                </option>
            );
        });
        const {currentSlide} = this.props;
        const slideEditor = (currentSlide ? this.getSlideEditor(currentSlide) : null);
        return (
            <div>
                <div className="editor-toolbar toolbar">
                    <button onClick={this.confirmAndPublish}>Julkaise muutokset</button>
                </div>
                <div className="eep-editor toolbar">
                    <label htmlFor="eep-input">Erikoisviesti:&nbsp;</label>
                    <input
                        value={this.props.data.eep || ''}
                        onChange={this.eepChanged}
                        id="eep-input"
                    />
                </div>
                <div className="toolbar-header">Pakka</div>
                <div className="deck-selector toolbar">
                    <select
                        value={this.props.currentDeckName ? this.props.currentDeckName : ''}
                        onChange={this.deckChanged}
                        id="editor-select-deck"
                    >
                        {deckOptions}
                    </select>
                </div>
                <div className="deck-creator toolbar">
                    <label>
                        Nimi:{' '}
                        <input
                            ref={this.newDeckInputRef}
                            id="new-deck-name"
                        />
                    </label>
                    <button onClick={this.addNewDeck}>Uusi pakka</button>
                    <button onClick={this.deleteDeck} disabled={!this.props.currentDeckName}>
                        Poista
                    </button>
                </div>
                <div className="toolbar-header">Slide</div>
                <div className="slide-selector toolbar">
                    <select
                        value={currentSlide ? currentSlide.id : ''}
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
