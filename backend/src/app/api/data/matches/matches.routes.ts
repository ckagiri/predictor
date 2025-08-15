import { Router } from 'express';

import handleRequest from '../../handleRequest.js';
import { makeGetRoundMatchController } from './getRoundMatch.controller.js';
import { makeGetRoundMatchesController } from './getRoundMatches.controller.js';
import { makeGetSeasonMatchController } from './getSeasonMatch.controller.js';
import { makeGetSeasonMatchesController } from './getSeasonMatches.controller.js';
import { makeUpdateSeasonMatchController } from './updateSeasonMatch.controller.js';

export default {
  use: (competitionsRouter: Router) => {
    competitionsRouter.get(
      '/:competition/seasons/:season/matches',
      handleRequest(makeGetSeasonMatchesController)
    );
    competitionsRouter.get(
      '/:competition/seasons/:season/matches/:slug',
      handleRequest(makeGetSeasonMatchController)
    );
    competitionsRouter.patch(
      '/:competition/seasons/:season/matches/:slug',
      handleRequest(makeUpdateSeasonMatchController)
    );
    competitionsRouter.put(
      '/:competition/seasons/:season/matches/:slug',
      handleRequest(makeUpdateSeasonMatchController)
    );
    competitionsRouter.get(
      '/:competition/seasons/:season/rounds/:round/matches',
      handleRequest(makeGetRoundMatchesController)
    );
    competitionsRouter.get(
      '/:competition/seasons/:season/rounds/:round/matches/:slug',
      handleRequest(makeGetRoundMatchController)
    );
  },
};
