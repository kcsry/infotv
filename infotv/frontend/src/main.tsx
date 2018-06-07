import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import QS from 'query-string';

import TVApp from './TVApp';
import {Config} from './types';

// tslint:disable-next-line:no-var-requires
require('!style-loader!css-loader!postcss-loader!less-loader!current-style');

const options: Config = Object.assign(
    {},
    window.Options || {},
    QS.parse(window.location.search),
);

window.TV = ReactDOM.render(<TVApp config={options} />, document.getElementById('tv'));
