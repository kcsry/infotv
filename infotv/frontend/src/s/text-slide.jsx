/* eslint "react/no-multi-comp": 0 */

import React from "react";
const markdown = require("markdown-it")({
    html: true,
    breaks: true
});
import propTypes from "../prop-types";

function TextSlide(props) {
    const slide = props.slide;
    const html = markdown.render(slide.content || "");
    // clock-placeholder is a kludge to fix text wrapping around floated clock-element.
    return <div className="slide text-slide"><div className="clock-placeholder" /><span dangerouslySetInnerHTML={{ __html: html }} /></div>;
}

TextSlide.propTypes = {
    slide: propTypes.slide.isRequired,
};

class TextSlideEditor extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.setContent = this.setContent.bind(this);
    }

    setContent(event) {
        this.props.slide.content = event.target.value;
        this.props.tv.forceUpdate();
    }

    render() {
        const slide = this.props.slide;
        return (<div className="text-slide-editor">
            <textarea value={slide.content || ""} onChange={this.setContent} />
        </div>);
    }
}

TextSlideEditor.propTypes = {
    slide: propTypes.slide.isRequired,
    tv: propTypes.tv.isRequired,
};

export default {
    view: TextSlide,
    editor: TextSlideEditor,
};
