const Joi = require('joi');
const { ApiError } = require('./errorHandler');
const { ERROR_CODES } = require('../config/constants');

/**
 * Validate request against a Joi schema
 * @param {Object} schema - Joi schema object with body, query, params keys
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: true, // Ignore unknown keys
      stripUnknown: true, // Remove unknown keys
    };

    const toValidate = {};

    if (schema.body) toValidate.body = req.body;
    if (schema.query) toValidate.query = req.query;
    if (schema.params) toValidate.params = req.params;

    const validationSchema = Joi.object(schema);

    const { error, value } = validationSchema.validate(toValidate, validationOptions);

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      throw new ApiError(
        ERROR_CODES.VALIDATION_ERROR,
        'Erreur de validation',
        400,
        details
      );
    }

    // Replace req with validated values
    if (value.body) req.body = value.body;
    if (value.query) req.query = value.query;
    if (value.params) req.params = value.params;

    next();
  };
};

module.exports = { validate };
