import jsonFileService from './jsonFileService';

const dataPath = 'backend/api/data/';
const competitions = jsonFileService.getJsonFromFile(
  `${dataPath}competitions.json`,
);

const getCompetitions = () => {
  return competitions as any[];
};

export { getCompetitions };
