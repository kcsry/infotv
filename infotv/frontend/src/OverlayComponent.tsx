import React from 'react';
import moment from 'moment';
import _ from 'lodash';
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
        // eslint-disable-next-line prefer-destructuring
        icon = weather.weather[0].icon;
        icon = <img src={`http://openweathermap.org/img/w/${icon}.png`} alt="weather icon"/>;
    } catch (problem) {
        icon = null;
    }
    const temperatureString = _.isFinite(temperature)
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
        const text = moment().format('HH:mm');
        const weather = renderWeather(DatumManager.getValue('weather'));
        return (
            <div id="quad">
                <div className="clock">{text}</div>
                {weather}
            </div>
        );
    }
}