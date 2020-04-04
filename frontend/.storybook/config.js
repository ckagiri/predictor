import { configure } from '@storybook/react';

configure(
  [
    require.context('../components', true, /\.stories\.js$/),
    require.context('../admin', true, /\.stories\.js$/),
  ],
  module,
);
