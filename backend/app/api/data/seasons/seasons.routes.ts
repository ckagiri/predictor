import { Router } from 'express';

import handleRequest from '../../handleRequest.js';
import { makeGetSeasonsController } from './getSeasons.controller.js';

export default {
  use: (competitionsRouter: Router) => {
    competitionsRouter.get(
      '/:competition/seasons',
      handleRequest(makeGetSeasonsController)
    );
  },
};
