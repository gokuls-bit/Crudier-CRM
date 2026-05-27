/**
 * ============================================================
 * Crudier CRM — NoSQL Injection & XSS Sanitization Middleware
 * ============================================================
 * Recursively cleans req.body, req.query, and req.params of any keys
 * containing database operators (starting with '$' or containing '.')
 * and encodes HTML characters to guard against XSS injection.
 */

const sanitizeOperator = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitizeOperator(obj[key]);
        }
      }
    }
  }
};

const encodeXSS = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        } else {
          encodeXSS(obj[key]);
        }
      }
    }
  }
};

const sanitize = (req, res, next) => {
  if (req.body) {
    sanitizeOperator(req.body);
    encodeXSS(req.body);
  }
  if (req.query) {
    sanitizeOperator(req.query);
    encodeXSS(req.query);
  }
  if (req.params) {
    sanitizeOperator(req.params);
    encodeXSS(req.params);
  }
  next();
};

module.exports = sanitize;
