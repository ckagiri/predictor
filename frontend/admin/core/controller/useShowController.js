import inflection from 'inflection';

import useVersion from './useVersion';
import { useCheckMinimumRequiredProps } from './checkMinimumRequiredProps';
import { useGetOne } from '../dataProvider';
import { useTranslate } from '../i18n';
import { useNotify, useRedirect, useRefresh } from '../sideEffect';
import { CRUD_GET_ONE } from '../actions';

/**
 * Prepare data for the Show view
 *
 * @param {Object} props The props passed to the Show component.
 *
 * @return {Object} controllerProps Fetched data and callbacks for the Show view
 *
 * @example
 *
 * const MyShow = props => {
 *     const controllerProps = useShowController(props);
 *     return <ShowView {...controllerProps} {...props} />;
 * }
 */
const useShowController = props => {
  useCheckMinimumRequiredProps('Show', ['basePath', 'resource'], props);
  const { basePath, id, resource } = props;
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const version = useVersion();
  const { data: record, loading, loaded } = useGetOne(resource, id, {
    version, // used to force reload
    action: CRUD_GET_ONE,
    onFailure: () => {
      notify('ra.notification.item_doesnt_exist', 'warning');
      redirect('list', basePath);
      refresh();
    },
  });

  const resourceName = translate(`resources.${resource}.name`, {
    smart_count: 1,
    _: inflection.humanize(inflection.singularize(resource)),
  });
  const defaultTitle = translate('ra.page.show', {
    name: `${resourceName}`,
    id,
    record,
  });

  return {
    loading,
    loaded,
    defaultTitle,
    resource,
    basePath,
    record,
    version,
  };
};

export default useShowController;
