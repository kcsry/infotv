import React from "react";
import _ from "lodash";
import DatumManager from "../datum";
import moment from "moment";
import config from "../config";
import cx from "classnames";

function getTimes(prog) {
    const startMoment = moment.unix(prog.start_ts);
    const times = {};
    times.startTime = startMoment.format("HH:mm");
    times.endTime = moment.unix(prog.end_ts).format("HH:mm");
    times.className = cx({
        progInfo: true,
        soon: (Math.abs(moment().diff(startMoment)) < 5 * 60 * 1000),
    });
    return times;
}

function renderProgram(prog) {
    const times = getTimes(prog);

    return (
        <span className={times.className}>
            <span className="times">{times.startTime}-{times.endTime}</span>
            <span className="title">{prog.title}</span>
        </span>
    );
}

function renderSingleLoc(loc, currentProg, nextProg) {
    let nowElems = null;
    if (currentProg) {
        const nowTimes = getTimes(currentProg);
        nowElems = (<div className={nowTimes.className}>
            <div className="ntitle">Nyt</div>
            <div className="times">{nowTimes.startTime} &ndash; {nowTimes.endTime}</div>
            <div className="title">{currentProg.title}</div>
        </div>);
    }
    let nextElems = null;
    if (nextProg) {
        const nextTimes = getTimes(nextProg);
        nextElems = (<div className={nextTimes.className}>
            <div className="ntitle">Seuraavaksi</div>
            <div className="times">{nextTimes.startTime} &ndash; {nextTimes.endTime}</div>
            <div className="title">{nextProg.title}</div>
        </div>);
    }

    return (<div className="slide nownext-single-slide">
        <div className="loc">{loc}</div>
        {nowElems}
        {nowElems != null && nextElems != null ? <hr /> : null}
        {nextElems}
    </div>);
}

function NowNextSlide() {
    const onlyLoc = config.loc;
    const content = [];
    let onlyLocContent;
    const schedule = DatumManager.getValue("schedule");
    if (!schedule) return (<div>No schedule</div>);
    const nowTs = (+new Date()) / 1000;
    const order = schedule.location_order || [];
    _.each(order, (loc) => {
        if (onlyLoc && onlyLoc !== loc) return;
        const programs = _.filter(schedule.programs, (prog) => prog.location === loc);
        let currentProg = _.find(programs, (prog) => (nowTs >= prog.start_ts && nowTs < prog.end_ts));
        let nextProg = _.find(programs, (prog) => (prog.start_ts >= nowTs));
        if (onlyLoc) {
            onlyLocContent = renderSingleLoc(loc, currentProg, nextProg);
        }
        if (!(currentProg || nextProg)) return;

        currentProg = (currentProg ? (
            <div className="now"><span className="ntitle">Nyt</span> {renderProgram(currentProg)}</div>) : null);

        nextProg = (nextProg ? (
            <div className="next"><span className="ntitle">Seuraavaksi</span> {renderProgram(nextProg)}
            </div>) : null);

        content.push(
            <tr key={loc} className="nownext-table-row">
                <td className="nownext-table-cell loc">{loc}</td>
                <td className="nownext-table-cell current">{currentProg}</td>
                <td className="nownext-table-cell next">{nextProg}</td>
            </tr>
        );
    });
    if (onlyLocContent) {
        return onlyLocContent;
    }
    return (
        <div className="slide nownext-slide">
            <table className="nownext_table">
                <tbody>{content}</tbody>
            </table>
        </div>
    );
}

export default {
    view: NowNextSlide,
};
