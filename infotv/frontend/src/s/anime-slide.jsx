import React from "react";
import DatumManager from "../datum";

function AnimeSlide() {
    const anime = DatumManager.getValue("anime", {now: "", next: ""});
    return (
        <div className="slide anime-slide">
            <div className="now-header">Animehuoneessa nyt:</div>
            <div className="now">{anime.now}</div>
            <div className="next-header">Seuraavaksi:</div>
            <div className="next">{anime.next}</div>
        </div>
    );
}

export default {
    view: AnimeSlide,
};
