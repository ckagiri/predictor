import { createContext } from 'react';

/**
 * Context to store the result of the useListController() hook.
 *
 * Use the useListContext() hook to read the context.
 *
 * @typedef {Object} ListControllerProps
 * @prop {Object}   data an id-based dictionary of the list data, e.g. { 123: { id: 123, title: 'hello world' }, 456: { ... } }
 * @prop {Array}    ids an array listing the ids of the records in the list, e.g. [123, 456, ...]
 * @prop {integer}  total the total number of results for the current filters, excluding pagination. Useful to build the pagination controls. e.g. 23
 * @prop {boolean}  loaded boolean that is false until the data is available
 * @prop {boolean}  loading boolean that is true on mount, and false once the data was fetched
 * @prop {string}   basePath deduced from the location, useful for action buttons
 * @prop {string}   resource the resource name, deduced from the location. e.g. 'posts'
 * @prop {string}   resourcePath the api resource path e.g. '/posts'
 *
 * @example
 *
 * const List = props => {
 *     const controllerProps = useListController(props);
 *     return (
 *         <ListContext.Provider value={controllerProps}>
 *             ...
 *         </ListContext.Provider>
 *     );
 * };
 */
const ListContext = createContext({
  basePath: null,
  data: null,
  ids: null,
  loaded: null,
  loading: null,
  resource: null,
  resourcePath: null,
  total: null,
});

ListContext.displayName = 'ListContext';

export default ListContext;
