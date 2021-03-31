import React, {CSSProperties} from 'react';
import formatDate from 'date-fns/esm/format';
import parseISO from 'date-fns/esm/parseISO';
import cx from 'classnames';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import datumManager from '../DatumManager';
import {ViewProps} from './types';

const mediumIcons = {
    ig: 'fa fa-instagram',
    tw: 'fa fa-twitter',
};

const renderSocialElement = (element) => {
    const cn = `${cx({item: true, 'has-img': !!element.primary_image_url})} ${element.medium}`;
    const rand = parseInt(element.id.replace(/[^0-9]/g, ''), 10);
    const randf = (rand % 5000) / 5000;
    const duration = 0.6 + randf * 0.6;
    const style: CSSProperties = {
        backgroundImage: element.primary_image_url ? `url(${element.primary_image_url})` : undefined,
        animationDuration: `${duration}s`,
    };
    const author = `@${element.author_name.replace(/^@/, '')}`;
    const time = formatDate(parseISO(element.posted_on), 'HH:mm');
    const mediumIcon = mediumIcons[element.medium];
    return (
        <div style={style} className={cn} key={element.id}>
            <div className="meta">
                <i className={mediumIcon}/> {author} @ {time}
            </div>
            <div className="body">{element.message}</div>
        </div>
    );
};

interface SocialSlideState {
    timer?: number;
    frame: number;
}

class SocialSlideView extends React.Component<ViewProps, SocialSlideState> {
    public state: SocialSlideState = {
        frame: 0,
    };

    public UNSAFE_componentWillMount() {
        this.setState({timer: window.setInterval(this.tick, 600)});
    }

    public componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    private tick = () => {
        this.setState({frame: this.state.frame + 1});
    };

    public render() {
        const items = datumManager.getValue('social') || [];
        const limit = Math.min(this.state.frame, items.length);
        const childElements = items.slice(0, limit).map(renderSocialElement);
        return (
            <div className="slide social-slide">
                <ReactCSSTransitionGroup
                    transitionName="social-item"
                    transitionEnterTimeout={1000}
                    transitionLeaveTimeout={1000}
                >
                    {childElements}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}

const module = {
    id: 'social',
    view: SocialSlideView,
};

export default module;
