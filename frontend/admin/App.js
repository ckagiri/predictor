import React from 'react';
import PostIcon from '@material-ui/icons/Book';
import { Resource } from './core';
import { Admin } from './admin';

import { PostList, PostShow } from './posts';
import authProvider from './authProvider';
import jsonServerProvider from './jsonServerProvider';

const App = () => (
  <Admin
    dataProvider={jsonServerProvider('https://jsonplaceholder.typicode.com')}
    authProvider={authProvider}
  >
    <Resource name="posts" icon={PostIcon} list={PostList} show={PostShow} />
  </Admin>
);
export default App;
