import React from "react";
import formatDate from "date-fns/esm/format";

import isFinite from "lodash/isFinite";
import DatumManager from "./DatumManager";
import useCurrentDate from "./hooks/useCurrentDate";
import { Config, Slide } from "./types";

function renderWeather(weather: any) {
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
        icon = <img src={`http://openweathermap.org/img/w/${icon}.png`} alt="weather icon" />;
    } catch (problem) {
        icon = null;
    }
    const temperatureString =
        temperature && isFinite(temperature)
            ? `${temperature.toLocaleString("fi", { maximumFractionDigits: 1 })}°C`
            : "";
    return (
        <div className="weather">
            <span>{temperatureString}</span>
            <span>{icon}</span>
        </div>
    );
}

interface OverlayComponentProps {
    config: Config;
    currentSlide?: Slide;
}

export default function OverlayComponent({ config, currentSlide }: OverlayComponentProps) {
    const time = useCurrentDate();
    const text = formatDate(time, "HH:mm");
    const weather = renderWeather(DatumManager.getValue("weather"));
    return (
        <div
            id="quad"
            className={currentSlide?.type === "nownext" && config.loc ? "left" : undefined}
        >
            <div className="clock">{text}</div>
            {weather}
        </div>
    );
}
