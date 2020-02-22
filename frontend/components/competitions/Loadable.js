import * as React from 'react';
import loadable from 'utils/loadable';
import LoadingIndicator from 'components/ui/LoadingIndicator';

export default loadable(() => import('./CompetitionsPage'), {
  fallback: <LoadingIndicator />,
});
