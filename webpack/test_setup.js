// Setup file for enzyme
// See http://airbnb.io/enzyme/docs/installation/react-16.html
import 'core-js/shim';
import 'regenerator-runtime/runtime';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// Mocking translation function
global.__ = text => text; // eslint-disable-line

// Mocking locales to prevent unnecessary fallback messages
window.locales = { en: { domain: 'app', locale_data: { app: { '': {} } } } };

// This will return undefined in test environments and is expected in some helper functions.
window.URL_PREFIX = '';
