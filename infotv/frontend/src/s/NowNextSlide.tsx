import cx from "classnames";
import React from "react";
import formatDate from "date-fns/esm/format";
import { QRCodeSVG } from "qrcode.react";

import datumManager from "../DatumManager";
import { ViewProps } from "./types";
import { Config } from "../types";

interface ProgramTimes {
    startTime: string;
    endTime: string;
    className: string;
}

interface Program {
    identifier: string;
    start_ts: number;
    end_ts: number;
    title: string;
    location: string;
    tags_full?: [
        {
            identifier: string;
            icon: string;
        },
    ];
}

interface Schedule {
    location_order?: string[];
    programs: Program[];
}

/** Duration of breaks between programs in seconds. */
const BREAK_DURATION = 15 * 60;

function getTimes(prog: Program): ProgramTimes {
    const startDate = new Date(prog.start_ts * 1000);
    const endDate = new Date(prog.end_ts * 1000);
    const soon = Math.abs(prog.start_ts - prog.end_ts) < 5 * 60;
    return {
        startTime: formatDate(startDate, "HH:mm"),
        endTime: formatDate(endDate, "HH:mm"),
        className: cx({
            progInfo: true,
            soon,
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

function renderSingleLocFragment(
    config: Config,
    title: string,
    times: ProgramTimes,
    prog: Program,
    showQr: boolean,
) {
    const icons = prog.tags_full?.filter((tag) => tag.icon?.includes("fa-"));
    const isCameraBan = prog.tags_full?.some((tag) => tag.icon?.includes("custom-camera-ban"));
    const isVideoBan = prog.tags_full?.some((tag) => tag.icon?.includes("custom-video-ban"));
    return (
        <div className={times.className}>
            <div className="texts">
                <div className="ntitle">{title}</div>
                <div className="timesrow">
                    <span className="times">
                        {times.startTime} &ndash; {times.endTime}
                    </span>
                    <span className="icons">
                        {icons?.map((icon) => {
                            return <i key={icon.identifier} className={cx(icon.icon, "fa-xl")} />;
                        })}
                        {isCameraBan ? (
                            <span className="fa-stack">
                                <i className={"fa-solid fa-camera fa-stack-1x"} />
                                <i className={"fa-solid fa-ban fa-stack-2x"} />
                            </span>
                        ) : null}
                        {isVideoBan ? (
                            <span className="fa-stack">
                                <i className={"fa-solid fa-video fa-stack-1x"} />
                                <i className={"fa-solid fa-ban fa-stack-2x"} />
                            </span>
                        ) : null}
                    </span>
                </div>
                <div className="title">{prog.title}</div>
            </div>
            {showQr ? (
                <div className="qrcode">
                    <QRCodeSVG
                        value={`https://desucon.fi/${config.event}/ohjelma/${prog.identifier}/`}
                        size={1000}
                        marginSize={2}
                    />
                    <span>Anna palautetta</span>
                </div>
            ) : null}
        </div>
    );
}

function renderSingleLoc(config: Config, loc: string, currentProg?: Program, nextProg?: Program) {
    const nowElems = currentProg
        ? renderSingleLocFragment(config, "Nyt", getTimes(currentProg), currentProg, true)
        : null;
    const nextElems = nextProg
        ? renderSingleLocFragment(config, "Seuraavaksi", getTimes(nextProg), nextProg, false)
        : null;
    return (
        <div className="slide nownext-single-slide">
            <div className="loc">{loc}</div>
            {nowElems}
            {nowElems != null && nextElems != null ? <hr /> : null}
            {nextElems}
        </div>
    );
}

const NowNextSlideView: React.FC<ViewProps> = ({ config }) => {
    const onlyLoc = config.loc;
    const content: Array<React.ReactChild> = [];
    let onlyLocContent;
    const schedule = datumManager.getValue<Schedule>("schedule");
    if (!schedule) {
        return <div>No schedule</div>;
    }
    const nowTs = +new Date() / 1000;
    const order = schedule.location_order || [];
    order.forEach((loc: string) => {
        if (onlyLoc && onlyLoc !== loc) {
            return;
        }
        const programs = schedule.programs.filter((prog) => prog.location === loc);
        const currentProg = programs.find(
            (prog) => nowTs >= prog.start_ts && nowTs < prog.end_ts + BREAK_DURATION,
        );
        const nextProg = programs.find((prog) => prog.start_ts > nowTs);
        if (onlyLoc) {
            onlyLocContent = renderSingleLoc(config, loc, currentProg, nextProg);
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
    id: "nownext",
    view: NowNextSlideView,
};
