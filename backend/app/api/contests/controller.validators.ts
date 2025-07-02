import Joi from 'joi';

import {
  objectIdSchema,
  slugStringSchema,
} from '../common/validation/schemas.js';
import { JoiValidator } from '../common/validation/validatorWrapper.js';

const GetCompetitionSchema = Joi.object({
  competition: slugStringSchema.required(),
});

export const getCompetitionValidator = new JoiValidator(GetCompetitionSchema);

const GetMatchSchema = Joi.object({
  matchId: objectIdSchema.required(),
});

export const getMatchValidator = new JoiValidator(GetMatchSchema);

const predictionSlipSchema = Joi.object()
  .pattern(
    Joi.string().min(9).max(9), // key type
    Joi.string().min(3).max(3) // value type
  )
  .message(
    'Prediction(s) must have correct match-slug and score format, e.g., "abc-v-foo": "3-2"'
  )
  .min(1); // Require at least one key-value pair

const PickScoreSchema = Joi.object({
  competition: slugStringSchema.required(),
  loggedInUserId: Joi.string().optional(),
  predictionSlipSchema: predictionSlipSchema.required(),
  round: Joi.string().max(20).required(),
  season: Joi.string().min(4).max(9).required(),
});

export const pickScoreValidator = new JoiValidator(PickScoreSchema);

const PickJokerSchema = Joi.object({
  competition: slugStringSchema.required(),
  loggedInUserId: Joi.string().optional(),
  matchSlug: Joi.string().min(9).max(9).required(),
  round: Joi.string().max(20).required(),
  season: Joi.string().min(4).max(9).required(),
});

export const pickJokerValidator = new JoiValidator(PickJokerSchema);

const GetRoundMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
  loggedInUserId: Joi.string().optional(),
  predictorUsername: Joi.string().max(32).optional(),
  round: Joi.string().max(20),
  season: Joi.string().min(4).max(9),
});

export const getRoundMatchesValidator = new JoiValidator(GetRoundMatchesSchema);
