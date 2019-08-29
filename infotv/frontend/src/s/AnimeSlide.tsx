import React from 'react';
import datumManager from '../DatumManager';
import {SlideModule, ViewProps} from './types';

interface AnimeInfo {
    name: string;
    image: string;
    text: string;
}

interface AnimeInfos {
    now: AnimeInfo;
    next?: AnimeInfo;
}

const AnimePart = ({title, anime, className}: { title: string; anime: AnimeInfo; className: string }) => {
    return (
        <div className={className}>
            <div className="header">{title}</div>
            <div className="name">{anime.name}</div>
            <img src={anime.image} alt=""/>
            <div className="text">{anime.text}</div>
        </div>
    );
};

const AnimeSlide: React.FC<ViewProps> = () => {
    const anime = datumManager.getValue<AnimeInfos>('anime', {
        now: {name: '', image: '', text: ''},
        next: {name: '', image: '', text: ''},
    });
    return (
        <div className="slide anime-slide">
            <div className="slide-header">Animehuone</div>
            <div className="container">
                {anime.now.name && (
                    <AnimePart anime={anime.now} title="Nyt menossa" className="now"/>
                )}
                {anime.next.name && (
                    <AnimePart anime={anime.next} title="Seuraavaksi vuorossa" className="next"/>
                )}
            </div>
        </div>
    );
};

const module: SlideModule = {
    id: 'anime',
    view: AnimeSlide,
};

export default module;
