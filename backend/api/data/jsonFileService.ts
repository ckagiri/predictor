import path from 'path';

function getJsonFromFile(file: string) {
  const fs = require('fs');
  const json = getConfig(file);
  return json;

  function readJsonFileSync(filepath: string, encoding: string | undefined) {
    if (typeof encoding === 'undefined') {
      encoding = 'utf8';
    }
    const file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
  }

  function getConfig(file: string) {
    const filepath = path.join(process.cwd(), file);
    return readJsonFileSync(filepath, undefined);
  }
}

const service = {
  getJsonFromFile: getJsonFromFile,
};

export default service;
