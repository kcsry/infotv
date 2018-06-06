import React from "react";
import DatumManager from "../datum";

function AnimePart({title, anime, className}) {
    return (
        <div className={className}>
            <div className="header">{title}</div>
            <div className="name">{anime.name}</div>
            <img src={anime.image} alt=""/>
            <div className="text">{anime.text}</div>
        </div>
    );
}

function AnimeSlide() {
    const anime = DatumManager.getValue("anime", {
        now: {name: "", image: "", text: ""},
        next: {name: "", image: "", text: ""},
    });
    return (
        <div className="slide anime-slide">
            <div className="slide-header">Animehuone</div>
            <div className="container">
                {anime.now.name && <AnimePart anime={anime.now} title="Nyt menossa" className="now" />}
                {anime.next.name && <AnimePart anime={anime.next} title="Seuraavaksi vuorossa" className="next" />}
            </div>
        </div>
    );
}

export default {
    view: AnimeSlide,
};
