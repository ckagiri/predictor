import Joi from 'joi';

import { slugStringSchema } from '../common/validation/schemas.js';
import { JoiValidator } from '../common/validation/validatorWrapper.js';

const GetCompetitionSchema = Joi.object({
  competition: slugStringSchema.required(),
});

export const getCompetitionValidator = new JoiValidator(GetCompetitionSchema);

const GetMatchSchema = Joi.object({
  competition: slugStringSchema.required(),
  loggedInUserId: Joi.string().optional(),
  match: Joi.string().min(7).max(9).required(), // Match slug
  season: Joi.string().min(4).max(9).required(),
});

export const getMatchValidator = new JoiValidator(GetMatchSchema);

const predictionSlipSchema = Joi.object()
  .pattern(
    Joi.string().min(7).max(9), // key type
    Joi.string().min(3).max(3) // value type
  )
  .min(1)
  .message(
    'Prediction(s) must have correct match-slug and score format, e.g., "abc-foo": "3-2"'
  );

const PickScoreSchema = Joi.object({
  competition: slugStringSchema.required(),
  loggedInUserId: Joi.string().required(),
  predictionSlip: predictionSlipSchema.required(),
  round: Joi.string().max(20).required(),
  season: Joi.string().min(4).max(9).required(),
});

export const pickScoreValidator = new JoiValidator(PickScoreSchema);

const PickJokerSchema = Joi.object({
  competition: slugStringSchema.required(),
  loggedInUserId: Joi.string().required(),
  match: Joi.object()
    .pattern(
      'slug',
      Joi.string().min(7).max(9) // Match slug
    )
    .min(1)
    .max(1)
    .required(),
  round: Joi.string().max(20).required(),
  season: Joi.string().min(4).max(9).required(),
});

export const pickJokerValidator = new JoiValidator(PickJokerSchema);

const AutoPickPredictionsSchema = Joi.object({
  competition: slugStringSchema.required(),
  loggedInUserId: Joi.string().required(),
  predictionSlipSchema: predictionSlipSchema.required(),
  round: Joi.string().max(20).required(),
  season: Joi.string().min(4).max(9).required(),
});

export const autoPickPredictionsValidator = new JoiValidator(
  AutoPickPredictionsSchema
);

const GetRoundMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
  loggedInUserId: Joi.string().optional(),
  predictorUsername: Joi.string().max(32).optional(),
  round: Joi.string().max(20),
  season: Joi.string().min(4).max(9),
});

export const getRoundMatchesValidator = new JoiValidator(GetRoundMatchesSchema);
