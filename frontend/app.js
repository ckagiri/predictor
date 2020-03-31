// Needed for redux-saga es6 generator support
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import PostIcon from '@material-ui/icons/Book';
// Load the favicon
// import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import { Resource } from './admin/core';
import Admin from './admin/admin/Admin';

import { PostList, PostShow } from './admin/posts';
import authProvider from './admin/authProvider';
import jsonServerProvider from './admin/jsonServerProvider';

const MOUNT_NODE = document.getElementById('app');

const renderCore = () => {
  return (
    <AuthContext.Provider value={finalAuthProvider}>
      <DataProviderContext.Provider value={finalDataProvider}>
        <TranslationProvider i18nProvider={i18nProvider}>
          <ConnectedRouter history={finalHistory}>

          </ConnectedRouter>
        </TranslationProvider>
      </DataProviderContext.Provider>
    </AuthContext.Provider>
  );
};

const render = () => {
  ReactDOM.render(
    <Provider
      store={createAdminStore({
        authProvider: authProvider,
        dataProvider: jsonServerProvider('https://jsonplaceholder.typicode.com'),
        initialState,
        history: finalHistory,
      })}
    >
      {renderCore()}
    </Provider>

    <Admin
      dataProvider=
      authProvider={}
    >

    </Admin>,
    MOUNT_NODE,
  );
};

render();

if (module.hot) {
  // Hot reloadable React components
  // modules.hot.accept does not accept dynamic dependencies,
  // have to be constants at compile-time
  module.hot.accept([ 'admin/admin/Admin' ], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    render();
  });
}
