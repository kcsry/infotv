import React from 'react';
import ReactDOM from 'react-dom';
import QS from 'query-string';

import TVApp from './TVApp';
import {Config} from './types';

// tslint:disable-next-line:no-var-requires
require('!style-loader!css-loader!postcss-loader!less-loader!current-style');

const options: Config = {
    deck: '',
    edit: false,
    slow: false,
    event: '',
    ...(window.Options || {}),
    ...(QS.parse(window.location.search) as unknown as Partial<Config>),
};

window.TV = ReactDOM.render(<TVApp config={options}/>, document.getElementById('tv'));
