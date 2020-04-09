import { useCallback } from 'react';
// @ts-ignore
import inflection from 'inflection';
import { parse } from 'query-string';
import { useLocation } from 'react-router-dom';

import { useCheckMinimumRequiredProps } from './checkMinimumRequiredProps';
import { useCreate } from '../dataProvider';
import { useNotify, useRedirect } from '../sideEffect';
import { useTranslate } from '../i18n';
import { useVersion } from '.';
import { CRUD_CREATE } from '../actions';

/**
 * Prepare data for the Create view
 *
 * @param {Object} props The props passed to the Create component.
 *
 * @return {Object} controllerProps Fetched data and callbacks for the Create view
 *
 * @example
 *
 * import { useCreateController } from 'react-admin';
 * import CreateView from './CreateView';
 *
 * const MyCreate = props => {
 *     const controllerProps = useCreateController(props);
 *     return <CreateView {...controllerProps} {...props} />;
 * }
 */
const useCreateController = props => {
  useCheckMinimumRequiredProps('Create', ['basePath', 'resource'], props);
  const {
    basePath,
    resource,
    record = {},
    hasShow,
    hasEdit,
    successMessage,
  } = props;

  const location = useLocation();
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();
  const recordToUse = getRecord(location, record);
  const version = useVersion();

  const [create, { loading: saving }] = useCreate(resource);

  const save = useCallback(
    (
      data,
      redirectTo = 'list',
      { onSuccess, onFailure } = {}
    ) =>
      create(
        { payload: { data } },
        {
          action: CRUD_CREATE,
          onSuccess: onSuccess
            ? onSuccess
            : ({ data: newRecord }) => {
              notify(
                successMessage || 'ra.notification.created',
                'info',
                {
                  smart_count: 1,
                }
              );
              redirect(
                redirectTo,
                basePath,
                newRecord.id,
                newRecord
              );
            },
          onFailure: onFailure
            ? onFailure
            : error => {
              notify(
                typeof error === 'string'
                  ? error
                  : error.message ||
                  'ra.notification.http_error',
                'warning'
              );
            },
        }
      ),
    [create, notify, successMessage, redirect, basePath]
  );

  const resourceName = translate(`resources.${resource}.name`, {
    smart_count: 1,
    _: inflection.humanize(inflection.singularize(resource)),
  });
  const defaultTitle = translate('ra.page.create', {
    name: `${resourceName}`,
  });

  return {
    loading: false,
    loaded: true,
    saving,
    defaultTitle,
    save,
    resource,
    basePath,
    record: recordToUse,
    redirect: getDefaultRedirectRoute(hasShow, hasEdit),
    version,
  };
};

export default useCreateController;

export const getRecord = ({ state, search }, record = {}) => {
  if (state && state.record) {
    return state.record;
  }
  if (search) {
    try {
      const searchParams = parse(search);
      if (searchParams.source) {
        if (Array.isArray(searchParams.source)) {
          console.error(
            `Failed to parse location search parameter '${search}'. To pre-fill some fields in the Create form, pass a stringified source parameter (e.g. '?source={"title":"foo"}')`
          );
          return;
        }
        return JSON.parse(searchParams.source);
      }
    } catch (e) {
      console.error(
        `Failed to parse location search parameter '${search}'. To pre-fill some fields in the Create form, pass a stringified source parameter (e.g. '?source={"title":"foo"}')`
      );
    }
  }
  return record;
};

const getDefaultRedirectRoute = (hasShow, hasEdit) => {
  if (hasEdit) {
    return 'edit';
  }
  if (hasShow) {
    return 'show';
  }
  return 'list';
};
