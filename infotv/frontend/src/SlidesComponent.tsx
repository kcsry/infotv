import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import TVApp from './TVApp';
import {Config, Slide} from './types';
import slideModules from './s';


interface SlidesComponentProps {
    tv: TVApp;
    config: Config;
    animate: boolean;
    currentSlide: Slide;
}

export default class SlidesComponent extends React.Component<SlidesComponentProps, {}> {
    public getSlideComponent(slideData) {
        if (!slideData) {
            return <div/>;
        }
        const props = {
            slide: slideData,
            key: slideData.id,
            tv: this.props.tv,
            config: this.props.config,
        };
        const mod = slideModules[slideData.type];
        if (mod) {
            return React.createElement(mod.view, props);
        }
        return <div className="slide">(unknown slide type: {slideData.type})</div>;
    }

    public render() {
        const slideData = this.props.currentSlide;
        let slideComponent = this.getSlideComponent(slideData);
        if (this.props.animate) {
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
}
