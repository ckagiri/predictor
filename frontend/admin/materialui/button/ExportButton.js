import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import DownloadIcon from '@material-ui/icons/GetApp';
import {
  fetchRelatedRecords,
  useDataProvider,
  useNotify,
  ExporterContext,
} from '../../core';
import Button from './Button';

const ExportButton = ({
  sort,
  filter = defaultFilter,
  maxResults = 1000,
  resource,
  onClick,
  label = 'ra.action.export',
  icon = defaultIcon,
  ...rest
}) => {
  const exporter = useContext(ExporterContext);
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const handleClick = useCallback(
    event => {
      dataProvider
        .getList(resource, {
          sort,
          filter,
          pagination: { page: 1, perPage: maxResults },
        })
        .then(
          ({ data }) =>
            exporter &&
            exporter(
              data,
              fetchRelatedRecords(dataProvider),
              dataProvider,
              resource,
            ),
        )
        .catch(error => {
          console.error(error);
          notify('ra.notification.http_error', 'warning');
        });
      if (typeof onClick === 'function') {
        onClick(event);
      }
    },
    [
      dataProvider,
      exporter,
      filter,
      maxResults,
      notify,
      onClick,
      resource,
      sort,
    ],
  );

  return (
    <Button onClick={handleClick} label={label} {...sanitizeRestProps(rest)}>
      {icon}
    </Button>
  );
};

const defaultIcon = <DownloadIcon />;
const defaultFilter = {};

const sanitizeRestProps = ({ basePath, exporter, ...rest }) => rest;

ExportButton.propTypes = {
  basePath: PropTypes.string,
  exporter: PropTypes.func,
  filter: PropTypes.object,
  label: PropTypes.string,
  maxResults: PropTypes.number,
  resource: PropTypes.string.isRequired,
  sort: PropTypes.exact({
    field: PropTypes.string,
    order: PropTypes.string,
  }),
  icon: PropTypes.element,
};

export default ExportButton;
