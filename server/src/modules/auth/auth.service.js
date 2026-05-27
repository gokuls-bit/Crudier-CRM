/**
 * ============================================================
 * Crudier CRM — Auth Service
 * ============================================================
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../../config/env');
const ApiError = require('../../utils/apiError');
const authRepository = require('./auth.repository');
const generateTokens = require('../../utils/generateToken');

const authService = {
  /**
   * Register a new user.
   */
  register: async (userData) => {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError('Registration failed: Email is already registered.', 400);
    }

    // Set default role if not provided or invalid
    const validRoles = ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'];
    const assignedRole = validRoles.includes(role) ? role : 'Intern';

    // Hash password (12 rounds)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await authRepository.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      workspaceId: null,
      avatar: null,
      isActive: true,
    });

    // Remove password from response
    delete user.password;
    return user;
  },

  /**
   * Login a user and return tokens.
   */
  login: async (email, password) => {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new ApiError('Login failed: Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new ApiError('Login failed: Your account is inactive.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError('Login failed: Invalid email or password.', 401);
    }

    const tokens = generateTokens(user);
    
    // Save refresh token to whitelist DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await authRepository.saveRefreshToken(user._id, tokens.refreshToken, expiresAt);

    // Remove password from returned user object
    const userResponse = { ...user };
    delete userResponse.password;

    return { user: userResponse, ...tokens };
  },

  /**
   * Refresh the access token using a refresh token.
   */
  refreshToken: async (token) => {
    if (!token) {
      throw new ApiError('Refresh failed: Refresh token is missing.', 401);
    }

    // Verify token exists in database whitelist
    const whitelisted = await authRepository.findRefreshToken(token);
    if (!whitelisted) {
      throw new ApiError('Refresh failed: Refresh token has been revoked.', 401);
    }

    try {
      const decoded = jwt.verify(token, env.jwtRefreshSecret);
      const user = await authRepository.findById(decoded.id);

      if (!user) {
        throw new ApiError('Refresh failed: User no longer exists.', 401);
      }

      if (!user.isActive) {
        throw new ApiError('Refresh failed: User account is inactive.', 403);
      }

      // Generate a new set of tokens (rotation strategy)
      const tokens = generateTokens(user);

      // Rotate: delete the old one and save the new one
      await authRepository.deleteRefreshToken(token);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authRepository.saveRefreshToken(user._id, tokens.refreshToken, expiresAt);

      return tokens;
    } catch (err) {
      // Clean up invalid/expired tokens from DB if present
      await authRepository.deleteRefreshToken(token);
      throw new ApiError('Refresh failed: Invalid or expired refresh token.', 401);
    }
  },

  /**
   * Log out and revoke refresh token.
   */
  logout: async (token) => {
    if (token) {
      await authRepository.deleteRefreshToken(token);
    }
  },
};

module.exports = authService;
