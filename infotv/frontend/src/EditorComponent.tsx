import React from "react";
import { createPortal } from "react-dom";
import fetchJSON from "./fetchJSON";
import slideModules from "./s";
import { Config, Slide, TVData } from "./types";
import TVApp from "./TVApp";
import { TextSlide } from "./s/TextSlide";

interface EditorComponentProps {
    data: TVData;
    tv: TVApp;
    config: Config;
    currentDeckName: string;
    currentSlide?: Slide;
}

interface EditorComponentState {
    advancedEdit: boolean;
    deckEditMode: null | "create" | "rename";
    deckInputValue: string;
    isDirty: boolean;
    previewVertical: boolean;
}

export default class EditorComponent extends React.Component<
    EditorComponentProps,
    EditorComponentState
> {
    private deckInputRef: React.RefObject<HTMLInputElement> = React.createRef();
    private deckEditCancelling = false;

    public state: EditorComponentState = {
        advancedEdit: localStorage.getItem("editor.advancedEdit") === "true",
        deckEditMode: null,
        deckInputValue: "",
        isDirty: false,
        previewVertical: localStorage.getItem("editor.previewVertical") === "true",
    };

    /** Flag the deck dirty and refresh preview. */
    public markDirty = () => {
        this.setState({ isDirty: true });
        this.props.tv.forceUpdate();
    };

    private togglePreviewOrientation = () => {
        const previewVertical = !this.state.previewVertical;
        localStorage.setItem("editor.previewVertical", String(previewVertical));
        document.getElementById("editor")?.classList.toggle("preview-vertical", previewVertical);
        this.setState({ previewVertical });
    };

    public getSlideEditor(currentSlide: Slide) {
        const slideModule = slideModules[currentSlide.type];
        let editorComponent: React.ReactElement = <div>No editor for ${currentSlide.type}</div>;
        if (slideModule && slideModule.editor) {
            editorComponent = React.createElement(slideModule.editor, {
                slide: currentSlide,
                editor: this,
                config: this.props.config,
                tv: this.props.tv,
            });
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
        const slideBeginInput = (
            <input
                type="datetime-local"
                value={
                    currentSlide.scheduleBegin
                        ? new Date(
                              currentSlide.scheduleBegin.getTime() -
                                  currentSlide.scheduleBegin.getTimezoneOffset() * 60 * 1000,
                          )
                              ?.toISOString()
                              ?.slice(0, 16)
                        : ""
                }
                onChange={this.slideBeginChanged}
            />
        );
        const slideEndInput = (
            <input
                type="datetime-local"
                value={
                    currentSlide.scheduleEnd
                        ? new Date(
                              currentSlide.scheduleEnd.getTime() -
                                  currentSlide.scheduleEnd.getTimezoneOffset() * 60 * 1000,
                          )
                              ?.toISOString()
                              ?.slice(0, 16)
                        : ""
                }
                onChange={this.slideEndChanged}
            />
        );
        const { advancedEdit } = this.state;
        const isHidden = currentSlide.duration <= 0;
        return (
            <div className="slide-editor">
                <div className="slide-editor-col">
                    <div className={`toolbar${advancedEdit ? " equal-width" : ""}`}>
                        <label>Sliden tyyppi: {slideTypeSelect}</label>
                        {advancedEdit && <label>Sliden kesto: {slideDurationInput}&times;</label>}
                    </div>
                    {editorComponent}
                </div>
                <div className="slide-editor-col">
                    <label className="field-label">Tulee näkyviin: {slideBeginInput}</label>
                    <label className="field-label">Poistuu näkyvistä: {slideEndInput}</label>
                    {!advancedEdit && (
                        <button onClick={this.toggleSlideVisibility}>
                            {isHidden ? "Näytä slide" : "Piilota slide"}
                        </button>
                    )}
                    <button onClick={this.deleteCurrentSlide}>Poista slide</button>
                    <button
                        className="preview-aspectratio-btn"
                        onClick={this.togglePreviewOrientation}
                    >
                        {this.state.previewVertical ? "Horizontal" : "Vertical"}
                    </button>
                </div>
            </div>
        );
    }

    public componentDidMount() {
        if (this.state.previewVertical) {
            document.getElementById("editor")?.classList.add("preview-vertical");
        }
    }

    private slideClicked = (id: string) => {
        this.props.tv.viewSlideById(id);
    };

    private eepChanged = (event: any) => {
        const eep = event.target.value;
        this.props.data.eep = eep && eep.length ? eep : null;
        this.markDirty();
    };

    private slideTypeChanged = (event: any) => {
        if (this.props.currentSlide) {
            this.props.currentSlide.type = event.target.value;
        }
        this.markDirty();
    };

    private slideBeginChanged = (event: any) => {
        if (event.target.validity.valid && this.props.currentSlide) {
            if (event.target.value) {
                const date = new Date(event.target.value + "Z");
                date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                this.props.currentSlide.scheduleBegin = date;
            } else {
                this.props.currentSlide.scheduleBegin = undefined;
            }
            this.markDirty();
        }
    };

    private slideEndChanged = (event: any) => {
        if (event.target.validity.valid && this.props.currentSlide) {
            if (event.target.value) {
                const date = new Date(event.target.value + "Z");
                date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                this.props.currentSlide.scheduleEnd = date;
            } else {
                this.props.currentSlide.scheduleEnd = undefined;
            }
            this.markDirty();
        }
    };

    private dragSrcId: string | null = null;

    private moveSlide = (targetId: string) => {
        const srcId = this.dragSrcId;
        this.dragSrcId = null;
        if (!srcId || srcId === targetId) return;
        const slides = this.props.tv.getDeck();
        const srcIdx = slides.findIndex((s) => s.id === srcId);
        if (srcIdx === -1) return;
        const [removed] = slides.splice(srcIdx, 1);
        const newTgtIdx = slides.findIndex((s) => s.id === targetId);
        if (newTgtIdx === -1) return;
        slides.splice(newTgtIdx, 0, removed);
        this.markDirty();
        this.props.tv.viewSlideById(removed.id);
    };

    private slideDurationChanged = (event: any) => {
        if (this.props.currentSlide) {
            this.props.currentSlide.duration = parseInt(event.target.value, 10);
            this.markDirty();
        }
    };

    private confirmAndPublish = () => {
        if (this.props.data.decks.default.length <= 0) {
            alert("Ei voi julkaista tyhjää Default-pakkaa");
            return false;
        }
        const deckFormData = new FormData();
        deckFormData.append("action", "post_deck");
        deckFormData.append("data", JSON.stringify(this.props.data));
        fetchJSON(location.pathname, { method: "POST", body: deckFormData })
            .then((data: any) => {
                alert(data.message || "wut :(");
                this.setState({ isDirty: false });
            })
            .catch((err: any) => {
                alert((err.body && err.body.message) || "it broke");
            });
        return true;
    };

    private toggleSlideVisibility = () => {
        if (!this.props.currentSlide) return;
        this.props.currentSlide.duration = this.props.currentSlide.duration <= 0 ? 1 : 0;
        this.markDirty();
    };

    private advancedEditChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const advancedEdit = event.target.checked;
        localStorage.setItem("editor.advancedEdit", String(advancedEdit));
        if (!advancedEdit && this.props.currentDeckName !== "default") {
            this.props.tv.changeDeck("default");
        }
        this.setState({ advancedEdit });
    };

    private deckChanged = (event: any) => {
        this.props.tv.changeDeck(event.target.value);
    };

    private startCreateDeck = () => {
        this.deckEditCancelling = false;
        this.setState({ deckEditMode: "create", deckInputValue: "" }, () => {
            this.deckInputRef.current?.focus();
        });
    };

    private startRenameDeck = () => {
        this.deckEditCancelling = false;
        this.setState(
            { deckEditMode: "rename", deckInputValue: this.props.currentDeckName },
            () => {
                this.deckInputRef.current?.select();
            },
        );
    };

    private commitDeckEdit = () => {
        if (this.deckEditCancelling) return;
        const { deckEditMode, deckInputValue } = this.state;
        this.setState({ deckEditMode: null, deckInputValue: "" });
        const name = deckInputValue.trim().toLowerCase();
        if (!name) return;
        if (deckEditMode === "create") {
            this.props.tv.addNewDeck(name);
            this.markDirty();
        } else if (deckEditMode === "rename") {
            const { currentDeckName, data } = this.props;
            if (name === currentDeckName) return;
            if (data.decks[name]) {
                alert("Pakka on jo olemassa.");
                return;
            }
            data.decks[name] = data.decks[currentDeckName];
            delete data.decks[currentDeckName];
            this.markDirty();
            this.props.tv.changeDeck(name);
        }
    };

    private cancelDeckEdit = () => {
        this.deckEditCancelling = true;
        this.setState({ deckEditMode: null, deckInputValue: "" });
    };

    private deckInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") this.commitDeckEdit();
        else if (e.key === "Escape") this.cancelDeckEdit();
    };

    private deleteDeck = () => {
        this.markDirty();
        this.props.tv.deleteCurrentDeck();
    };

    private addNewSlide = () => {
        this.markDirty();
        this.props.tv.addNewSlide();
    };

    private deleteCurrentSlide = () => {
        this.markDirty();
        this.props.tv.deleteCurrentSlide();
    };

    public render() {
        if (!(this.props.data && this.props.data.decks)) {
            return <div>Missing decks :(</div>;
        }
        const deckOptions = Object.keys(this.props.data.decks).map((name) => (
            <option key={name} value={name}>
                {name}
            </option>
        ));
        const { deckEditMode, deckInputValue } = this.state;
        const { currentSlide, currentDeckName } = this.props;
        const slides = this.props.tv.getDeck();
        const slideItems = slides.map((s, i) => {
            let label = `${i + 1}. ${s.type}`;
            if (s.type === "text") {
                let preview = (s as TextSlide).content || "";
                if (preview.length > 20) {
                    preview = `${preview.substring(0, 20)}…`;
                }
                if (preview) label += `: ${preview}`;
            }
            const classes = [
                "slide-item",
                currentSlide?.id === s.id && "selected",
                s.duration <= 0 && "inactive",
            ]
                .filter(Boolean)
                .join(" ");
            return (
                <li
                    key={s.id}
                    className={classes}
                    draggable
                    onClick={() => this.slideClicked(s.id)}
                    onDragStart={() => {
                        this.dragSrcId = s.id;
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => this.moveSlide(s.id)}
                >
                    {label}
                </li>
            );
        });
        const { advancedEdit } = this.state;
        const topPanel = document.getElementById("editor-top");
        const slideEditorPortal =
            topPanel && currentSlide
                ? createPortal(this.getSlideEditor(currentSlide), topPanel)
                : null;
        return (
            <div className="aside-content">
                <h2>InfoTV</h2>
                {slideEditorPortal}
                {advancedEdit && (
                    <>
                        <div className="toolbar-header">
                            Pakka
                            <button
                                className="header-icon-btn icon-btn"
                                title="Uusi pakka"
                                onClick={this.startCreateDeck}
                            >
                                <i className="fas fa-plus" />
                            </button>
                        </div>
                        <div className="deck-controls toolbar">
                            {deckEditMode ? (
                                <input
                                    ref={this.deckInputRef}
                                    className="deck-name-input"
                                    value={deckInputValue}
                                    placeholder={
                                        deckEditMode === "create"
                                            ? "Uusi pakka..."
                                            : "Pakan nimi..."
                                    }
                                    onChange={(e) =>
                                        this.setState({ deckInputValue: e.target.value })
                                    }
                                    onBlur={this.commitDeckEdit}
                                    onKeyDown={this.deckInputKeyDown}
                                />
                            ) : (
                                <select
                                    value={currentDeckName ?? ""}
                                    onChange={this.deckChanged}
                                    id="editor-select-deck"
                                >
                                    {deckOptions}
                                </select>
                            )}
                            {currentDeckName !== "default" && !deckEditMode && (
                                <>
                                    <button
                                        className="icon-btn"
                                        title="Nimeä uudelleen"
                                        onClick={this.startRenameDeck}
                                    >
                                        <i className="fas fa-pen" />
                                    </button>
                                    <button
                                        className="icon-btn"
                                        title="Poista pakka"
                                        onClick={this.deleteDeck}
                                    >
                                        <i className="fas fa-trash" />
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
                <div className="toolbar-header">
                    Slide
                    <button
                        className="header-icon-btn icon-btn"
                        title="Uusi slide"
                        onClick={this.addNewSlide}
                    >
                        <i className="fas fa-plus" />
                    </button>
                </div>
                <ul className="slide-list">{slideItems}</ul>
                <div className="aside-bottom">
                    <div className="eep-editor toolbar">
                        <label htmlFor="eep-input">Erikoisviesti:&nbsp;</label>
                        <input
                            value={this.props.data.eep || ""}
                            onChange={this.eepChanged}
                            id="eep-input"
                        />
                    </div>
                    <label className="toolbar advanced-edit-toggle">
                        <input
                            type="checkbox"
                            checked={advancedEdit}
                            onChange={this.advancedEditChanged}
                        />
                        &nbsp;Advanced
                    </label>
                    <div className="editor-toolbar toolbar">
                        <button
                            className="save-btn"
                            onClick={this.confirmAndPublish}
                            disabled={!this.state.isDirty}
                        >
                            Tallenna
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
