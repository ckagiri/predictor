import { stringify } from 'query-string';
import { fetchUtils } from './lib/core';

/**
 *
 * @example
 *
 * getList          => GET http://my.api.url/posts?_sort=title&_order=ASC&_start=0&_end=24
 * getOne           => GET http://my.api.url/posts/123
 * getManyReference => GET http://my.api.url/posts?author_id=345
 * getMany          => GET http://my.api.url/posts/123, GET http://my.api.url/posts/456, GET http://my.api.url/posts/789
 * create           => POST http://my.api.url/posts/123
 * update           => PUT http://my.api.url/posts/123
 * updateMany       => PUT http://my.api.url/posts/123, PUT http://my.api.url/posts/456, PUT http://my.api.url/posts/789
 * delete           => DELETE http://my.api.url/posts/123
 *
 * @example
 *
 * import React from 'react';
 * import { Admin, Resource } from 'react-admin';
 * import jsonServerProvider from './jsonServerProvider';
 *
 * import { PostList } from './posts';
 *
 * const App = () => (
 *     <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */
export default (apiUrl, httpClient = fetchUtils.fetchJson) => ({
  getList: (resourcePath, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...fetchUtils.flattenObject(params.filter),
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _end: page * perPage,
    };
    const url = `${apiUrl}${resourcePath}`;

    return httpClient(url).then(({ headers, json }) => {
      return {
        data: json,
        total: 500,
      };
    });
  },

  getOne: (resourcePath, params) =>
    httpClient(`${apiUrl}/${resourcePath}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  getMany: (resourcePath, params) => {
    const query = {
      id: params.ids,
    };
    const url = `${apiUrl}/${resourcePath}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resourcePath, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...fetchUtils.flattenObject(params.filter),
      [params.target]: params.id,
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _end: page * perPage,
    };
    const url = `${apiUrl}${resourcePath}`;

    return httpClient(url).then(({ headers, json }) => {
      return {
        data: json,
        total: 500,
      };
    });
  },

  update: (resourcePath, params) =>
    httpClient(`${apiUrl}/${resourcePath}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  // json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
  updateMany: (resourcePath, params) =>
    Promise.all(
      params.ids.map(id =>
        httpClient(`${apiUrl}/${resourcePath}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        }),
      ),
    ).then(responses => ({ data: responses.map(({ json }) => json.id) })),

  create: (resourcePath, params) =>
    httpClient(`${apiUrl}/${resourcePath}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    })),

  delete: (resourcePath, params) =>
    httpClient(`${apiUrl}/${resourcePath}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),

  // json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
  deleteMany: (resourcePath, params) =>
    Promise.all(
      params.ids.map(id =>
        httpClient(`${apiUrl}/${resourcePath}/${id}`, {
          method: 'DELETE',
        }),
      ),
    ).then(responses => ({ data: responses.map(({ json }) => json.id) })),
});
