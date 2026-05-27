/**
 * ============================================================
 * Crudier CRM — Custom Request Validation Middleware
 * ============================================================
 */

const ApiError = require('../utils/apiError');

/**
 * Validates req.body, req.query, or req.params against validation schemas.
 * 
 * @param {Object} schemas - Object with keys: body, query, params
 * @param {Object} schemas.body - Validation rules for req.body
 * @param {Object} schemas.query - Validation rules for req.query
 * @param {Object} schemas.params - Validation rules for req.params
 * 
 * Rules are functions that return true if valid, or a string/Error with the error message.
 * Example usage:
 * validate({
 *   body: {
 *     email: (val) => /^\S+@\S+\.\S+$/.test(val) || 'Invalid email format',
 *     password: (val) => (val && val.length >= 6) || 'Password must be at least 6 characters'
 *   }
 * })
 */
const validate = (schemas) => {
  return (req, res, next) => {
    const targets = ['body', 'query', 'params'];

    for (const target of targets) {
      if (schemas[target] && req[target]) {
        const rules = schemas[target];
        const data = req[target];

        for (const [field, ruleFn] of Object.entries(rules)) {
          const val = data[field];
          const result = ruleFn(val, data);

          if (result !== true) {
            const msg = typeof result === 'string' ? result : `Invalid field: ${field}`;
            return next(new ApiError(msg, 400));
          }
        }
      }
    }

    next();
  };
};

module.exports = validate;
