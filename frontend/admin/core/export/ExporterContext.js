import { createContext } from 'react';

import defaultExporter from './defaultExporter';

const ExporterContext = createContext(defaultExporter);

ExporterContext.displayName = 'ExporterContext';

export default ExporterContext;
