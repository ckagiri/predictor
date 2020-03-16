import * as React from 'react';
import loadable from 'utils/loadable';

export default loadable(() => import('./CompetitionsPage'), {
  fallback: <div />,
});
