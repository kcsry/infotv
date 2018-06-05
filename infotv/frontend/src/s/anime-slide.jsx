import React from "react";
import DatumManager from "../datum";

function AnimeSlide() {
    const anime = DatumManager.getValue("anime", {now: {name: "", image: "", text: ""}, next: {name: "", image: "", text: ""}});
    return (
        <div className="slide anime-slide">
            <div className="slide-header">Animehuone</div>
            <div className="container">
                {anime.now.name &&
                <div className="now">
                    <div className="header">Nyt menossa</div>
                    <div className="name">{anime.now.name}</div>
                    <img src={anime.now.image} alt=""/>
                    <div className="text">{anime.now.text}</div>
                </div>
                }
                {anime.next.name &&
                <div className="next">
                    <div className="header">Seuraavaksi vuorossa</div>
                    <div className="name">{anime.next.name}</div>
                    <img src={anime.next.image} alt=""/>
                    <div className="text">{anime.next.text}</div>
                </div>
                }
            </div>
        </div>
    );
}

export default {
    view: AnimeSlide,
};
