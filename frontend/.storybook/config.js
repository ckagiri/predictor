import { configure } from '@storybook/react';

// automatically import all files ending in *.stories.js
const req = require.context('../components', true, /\.stories\.js$/);

configure(req, module);
