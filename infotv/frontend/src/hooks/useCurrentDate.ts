import React from "react";
import useInterval from "./useInterval";

export default function useCurrentDate(updateInterval = 5000) {
    const [time, setTime] = React.useState(new Date());
    const tick = React.useCallback(() => setTime(new Date()), []);
    useInterval(tick, updateInterval);
    return time;
}
