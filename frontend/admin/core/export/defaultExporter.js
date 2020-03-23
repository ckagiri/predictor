import jsonExport from 'jsonexport/dist';

import downloadCSV from './downloadCSV';

const defaultExporter = (data, _, __, resource) =>
  jsonExport(data, (err, csv) => downloadCSV(csv, resource));

export default defaultExporter;
