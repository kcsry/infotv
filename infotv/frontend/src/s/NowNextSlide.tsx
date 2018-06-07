import _ from 'lodash';
import cx from 'classnames';
import moment from 'moment';
import React from 'react';
import datumManager from '../DatumManager';
import {ViewProps} from './types';

interface ProgramTimes {
    startTime: string;
    endTime: string;
    className: string;
}

interface Program {
    start_ts: number;
    end_ts: number;
    title: string;
    location: string;
}

interface Schedule {
    location_order?: string[];
    programs: Program[];
}

function getTimes(prog: Program): ProgramTimes {
    const startMoment = moment.unix(prog.start_ts);
    const endMoment = moment.unix(prog.end_ts);
    return {
        startTime: startMoment.format('HH:mm'),
        endTime: endMoment.format('HH:mm'),
        className: cx({
            progInfo: true,
            soon: Math.abs(moment().diff(startMoment)) < 5 * 60 * 1000,
        }),
    };
}

function renderProgram(prog: Program) {
    const times = getTimes(prog);
    return (
        <span className={times.className}>
            <span className="times">
                {times.startTime}-{times.endTime}
            </span>
            <span className="title">{prog.title}</span>
        </span>
    );
}

function renderSingleLocFragment(title: string, times: ProgramTimes, prog: Program) {
    return (
        <div className={times.className}>
            <div className="ntitle">{title}</div>
            <div className="times">
                {times.startTime} &ndash; {times.endTime}
            </div>
            <div className="title">{prog.title}</div>
        </div>
    );
}

function renderSingleLoc(loc: string, currentProg?: Program, nextProg?: Program) {
    const nowElems = currentProg
        ? renderSingleLocFragment('Nyt', getTimes(currentProg), currentProg)
        : null;
    const nextElems = nextProg
        ? renderSingleLocFragment('Seuraavaksi', getTimes(nextProg), nextProg)
        : null;
    return (
        <div className="slide nownext-single-slide">
            <div className="loc">{loc}</div>
            {nowElems}
            {nowElems != null && nextElems != null ? <hr/> : null}
            {nextElems}
        </div>
    );
}

const NowNextSlideView: React.SFC<ViewProps> = ({config}) => {
    const onlyLoc = config.loc;
    const content: Array<React.ReactElement<any>> = [];
    let onlyLocContent;
    const schedule = datumManager.getValue<Schedule>('schedule');
    if (!schedule) {
        return <div>No schedule</div>;
    }
    const nowTs = +new Date() / 1000;
    const order = schedule.location_order || [];
    _.each(order, (loc) => {
        if (onlyLoc && onlyLoc !== loc) {
            return;
        }
        const programs = _.filter(schedule.programs, (prog) => prog.location === loc);
        const currentProg = _.find(programs, (prog) => nowTs >= prog.start_ts && nowTs < prog.end_ts);
        const nextProg = _.find(programs, (prog) => prog.start_ts >= nowTs);
        if (onlyLoc) {
            onlyLocContent = renderSingleLoc(loc, currentProg, nextProg);
        }
        if (!(currentProg || nextProg)) {
            return;
        }
        const currentProgEl = currentProg ? (
            <div className="now">
                <span className="ntitle">Nyt</span> {renderProgram(currentProg)}
            </div>
        ) : null;
        const nextProgEl = nextProg ? (
            <div className="next">
                <span className="ntitle">Seuraavaksi</span> {renderProgram(nextProg)}
            </div>
        ) : null;
        content.push(
            <tr key={loc} className="nownext-table-row">
                <td className="nownext-table-cell loc">{loc}</td>
                <td className="nownext-table-cell current">{currentProgEl}</td>
                <td className="nownext-table-cell next">{nextProgEl}</td>
            </tr>,
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
};

export default {
    id: 'nownext',
    view: NowNextSlideView,
};
