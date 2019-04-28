import React from 'react';
import formatDate from 'date-fns/esm/format';

import isFinite from 'lodash/isFinite';
import DatumManager from './DatumManager';

function renderWeather(weather) {
    if (!weather) {
        return null;
    }
    let temperature;
    let icon;
    try {
        temperature = weather.main.temp - 273.15;
    } catch (problem) {
        temperature = null;
    }
    try {
        icon = weather.weather[0].icon;
        icon = <img src={`http://openweathermap.org/img/w/${icon}.png`} alt="weather icon"/>;
    } catch (problem) {
        icon = null;
    }
    const temperatureString = temperature && isFinite(temperature)
        ? `${temperature.toLocaleString('fi', {maximumFractionDigits: 1})}°C`
        : '';
    return (
        <div className="weather">
            <span>{temperatureString}</span>
            <span>{icon}</span>
        </div>
    );
}

export default class OverlayComponent extends React.Component<{}, {}> {
    private clockUpdateTimer?: number;

    public componentWillMount() {
        this.clockUpdateTimer = window.setInterval(() => {
            this.forceUpdate();
        }, 5000);
    }

    public componentWillUnmount() {
        clearInterval(this.clockUpdateTimer);
        this.clockUpdateTimer = undefined;
    }

    public render() {
        const text = formatDate(new Date(), 'HH:mm');
        const weather = renderWeather(DatumManager.getValue('weather'));
        return (
            <div id="quad">
                <div className="clock">{text}</div>
                {weather}
            </div>
        );
    }
}
