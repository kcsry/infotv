/* eslint-disable new-cap, no-param-reassign */

import "babel-polyfill";

import React from "react";
import ReactDOM from "react-dom";
import TV from "./tv.jsx";

require("!style!css!postcss!less!current-style");

(function main(window) {
    const TVApp = React.createFactory(TV);
    window.React = React;
    window.TV = ReactDOM.render(TVApp(), document.getElementById("tv"));
}(window));
