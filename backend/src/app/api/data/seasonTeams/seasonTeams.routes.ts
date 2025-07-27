import { Router } from 'express';

import handleRequest from '../../handleRequest.js';
import { makeGetSeasonTeamsController } from './getSeasonTeams.controller.js';

export default {
  use: (competitionsRouter: Router) => {
    competitionsRouter.get(
      '/:competition/seasons/:season/teams',
      handleRequest(makeGetSeasonTeamsController)
    );
  },
};
