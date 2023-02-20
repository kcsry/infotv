import React from "react";
import ReactCSSTransitionGroup from "react-transition-group/CSSTransitionGroup";
import TVApp from "./TVApp";
import { Config, Slide } from "./types";
import slideModules from "./s";

interface SlidesComponentProps {
    tv: TVApp;
    config: Config;
    animate: boolean;
    currentSlide: Slide;
}

function getSlideComponent(slideData: Slide, tv: TVApp, config: Config) {
    if (!slideData) {
        return <div />;
    }
    const props = {
        slide: slideData,
        key: slideData.id,
        tv,
        config,
    };
    const mod = slideModules[slideData.type];
    if (mod) {
        return React.createElement(mod.view, props);
    }
    return <div className="slide">(unknown slide type: {slideData.type})</div>;
}

export default function SlidesComponent({
    tv,
    config,
    animate,
    currentSlide,
}: SlidesComponentProps) {
    let slideComponent = getSlideComponent(currentSlide, tv, config);
    if (animate) {
        slideComponent = (
            <ReactCSSTransitionGroup
                transitionName="slide"
                transitionEnterTimeout={1000}
                transitionLeaveTimeout={1000}
            >
                {slideComponent}
            </ReactCSSTransitionGroup>
        );
    }
    return slideComponent;
}
