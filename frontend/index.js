import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const MOUNT_NODE = document.getElementById('app');

const render = () => {
  ReactDOM.render(<App />, MOUNT_NODE);
};

render();

if (module.hot) {
  // Hot reloadable React components
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept(['./App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    render();
  });
}
