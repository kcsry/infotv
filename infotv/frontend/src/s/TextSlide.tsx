import React, { ChangeEvent } from "react";
import Markdown from "react-markdown";
import { Slide } from "../types";
import { EditorProps, ViewProps } from "./types";

export interface TextSlide extends Slide {
    content?: string;
}

type TextSlideViewProps = ViewProps<TextSlide>;

type TextSlideEditorProps = EditorProps<TextSlide>;

const TextSlideView: React.FC<TextSlideViewProps> = ({ slide }) => {
    // clock-placeholder is a kludge to fix text wrapping around floated clock-element.
    return (
        <div className="slide text-slide">
            <div className="clock-placeholder" />
            <Markdown source={slide.content || ""} escapeHtml={false} />
        </div>
    );
};

class TextSlideEditor extends React.Component<TextSlideEditorProps> {
    private setContent = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.props.slide.content = event.target.value;
        this.props.tv.forceUpdate();
    };

    public render() {
        const { slide } = this.props;
        return (
            <div className="text-slide-editor">
                <textarea value={slide.content || ""} onChange={this.setContent} />
            </div>
        );
    }
}

export default {
    id: "text",
    view: TextSlideView,
    editor: TextSlideEditor,
};
