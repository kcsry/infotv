import React, { CSSProperties } from "react";
import formatDate from "date-fns/esm/format";
import parseISO from "date-fns/esm/parseISO";
import cx from "classnames";
import ReactCSSTransitionGroup from "react-transition-group/CSSTransitionGroup";

import datumManager from "../DatumManager";
import useInterval from "../hooks/useInterval";

const mediumIcons: Record<string, string> = {
    ig: "fa fa-instagram",
    tw: "fa fa-twitter",
};

type SocialElement = Record<string, any>; // TODO: fix me

const renderSocialElement = (element: SocialElement) => {
    const cn = `${cx({ item: true, "has-img": !!element.primary_image_url })} ${element.medium}`;
    const rand = parseInt(element.id.replace(/[^0-9]/g, ""), 10);
    const randf = (rand % 5000) / 5000;
    const duration = 0.6 + randf * 0.6;
    const style: CSSProperties = {
        backgroundImage: element.primary_image_url
            ? `url(${element.primary_image_url})`
            : undefined,
        animationDuration: `${duration}s`,
    };
    const author = `@${element.author_name.replace(/^@/, "")}`;
    const time = formatDate(parseISO(element.posted_on), "HH:mm");
    const mediumIcon = mediumIcons[element.medium];
    return (
        <div style={style} className={cn} key={element.id}>
            <div className="meta">
                <i className={mediumIcon} /> {author} @ {time}
            </div>
            <div className="body">{element.message}</div>
        </div>
    );
};

function SocialSlideView() {
    const [frame, setFrame] = React.useState(0);
    const tick = React.useCallback(() => setFrame((frame) => frame + 1), []);
    useInterval(tick, 600);
    const items = datumManager.getValue("social") || [];
    const limit = Math.min(frame, items.length);
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

const module = {
    id: "social",
    view: SocialSlideView,
};

export default module;
