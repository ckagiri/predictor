import Joi from 'joi';

export const validSlugSchema = Joi.string()
  .pattern(/^\d+$/, { invert: true })
  .messages({
    'string.pattern.invert.base':
      '{{#label}} with value {:[.]} is not a valid identifier',
  })
  .pattern(/^[0-9a-fA-F]{24}$/, { invert: true })
  .message('ObjectID is not a valid identifier');
