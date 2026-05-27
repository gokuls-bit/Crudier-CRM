/**
 * ============================================================
 * Crudier CRM — JWT Token Generator Utility
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const env = require('../../config/env');

/**
 * Generates an access token and a refresh token for a user.
 * 
 * @param {Object} user - User object containing _id, email, role, etc.
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    workspaceId: user.workspaceId ? user.workspaceId.toString() : null,
  };

  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  const refreshToken = jwt.sign({ id: user._id.toString() }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
