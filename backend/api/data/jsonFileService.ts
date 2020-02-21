import path from 'path';

function getJsonFromFile(file: string) {
  const fs = require('fs');
  const json = getConfig(file);
  return json;

  function readJsonFileSync(filePath: string, encoding: string | undefined) {
    if (typeof encoding === 'undefined') {
      encoding = 'utf8';
    }
    const file = fs.readFileSync(filePath, encoding);
    return JSON.parse(file);
  }

  function getConfig(file: string) {
    const filePath = path.join(process.cwd(), file);
    return readJsonFileSync(filePath, undefined);
  }
}

const service = {
  getJsonFromFile: getJsonFromFile,
};

export default service;
