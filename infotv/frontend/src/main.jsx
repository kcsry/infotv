/* eslint-disable new-cap, no-param-reassign */

import "babel-polyfill";

import React from "react";
import ReactDOM from "react-dom";
import TVApp from "./tv.jsx";

// eslint-disable-next-line import/no-webpack-loader-syntax
require("!style!css!postcss!less!current-style");

window.React = React;
window.TV = ReactDOM.render(<TVApp />, document.getElementById("tv"));
