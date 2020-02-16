import jsonFileService from './jsonFileService';

const dataPath = 'backend/api/data/';
const competitions = jsonFileService.getJsonFromFile(
  `${dataPath}competitions.json`,
);
const seasons = jsonFileService.getJsonFromFile(`${dataPath}seasons.json`);
const teams = jsonFileService.getJsonFromFile(`${dataPath}teams.json`);
const matches = jsonFileService.getJsonFromFile(`${dataPath}matches.json`);
const rounds = jsonFileService.getJsonFromFile(`${dataPath}gamerounds.json`);
const predictions = jsonFileService.getJsonFromFile(
  `${dataPath}predictions.json`,
);

const getCompetitions = () => {
  return competitions as any[];
};

const getSeasons = () => {
  return seasons as any[];
};

const getTeams = () => {
  return teams as any[];
};

const getRounds = () => {
  return rounds as any[];
};

const getMatches = () => {
  return matches as any[];
};

const getPredictions = () => {
  return predictions as any[];
};

export {
  getCompetitions,
  getSeasons,
  getTeams,
  getRounds,
  getMatches,
  getPredictions,
};
