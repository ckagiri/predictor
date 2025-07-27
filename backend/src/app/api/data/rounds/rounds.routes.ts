import { Router } from 'express';

import handleRequest from '../../handleRequest.js';
import { makeGetRoundController } from './getRound.controller.js';
import { makeGetRoundsController } from './getRounds.controller.js';

export default {
  use: (competitionsRouter: Router) => {
    competitionsRouter.get(
      '/:competition/seasons/:season/rounds',
      handleRequest(makeGetRoundsController)
    );
    competitionsRouter.get(
      '/:competition/seasons/:season/rounds/:slug',
      handleRequest(makeGetRoundController)
    );
  },
};
