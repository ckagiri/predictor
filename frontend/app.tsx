// Needed for redux-saga es6 generator support
import '@babel/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import FontFaceObserver from 'fontfaceobserver';
import history from 'utils/history';
import 'sanitize.css/sanitize.css';

import App from 'components/app/App';
// Load the favicon
import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import configureStore from './configureStore';

// Observe loading of Open Sans (to remove open sans, remove the <link> tag in
// the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});
// When Open Sans is loaded, add a font-family using Open Sans to the body
openSansObserver.load().then(() => {
  document.body.classList.add('fontLoaded');
});

const initialState = {};
const store = configureStore(initialState, history);
const MOUNT_NODE = document.getElementById('app') as HTMLElement;

const render = (Component = App) => {
  ReactDOM.render(
    // tslint:disable-next-line:jsx-wrap-multiline
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Component />
      </ConnectedRouter>
    </Provider>,
    MOUNT_NODE
  );
};

render();

declare const module: any;
if (module.hot) {
  module.hot.accept(['./components/app/App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    // tslint:disable-next-line:max-line-length
    const App = require('./components/app/App').default; // https://github.com/webpack/webpack-dev-server/issues/100
    render(App);
  });
}
