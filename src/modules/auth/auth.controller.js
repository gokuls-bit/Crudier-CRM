/**
 * ============================================================
 * Crudier CRM — Auth Controller
 * ============================================================
 */

const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');

const authController = {
  /**
   * Register handler.
   */
  register: async (req, res) => {
    const user = await authService.register(req.body);
    return ApiResponse.success(res, 'Registration successful.', user, 201);
  },

  /**
   * Login handler.
   */
  login: async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Also place accessToken in cookie optionally, but mainly return in body
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    return ApiResponse.success(res, 'Login successful.', { user, accessToken });
  },

  /**
   * Logout handler.
   */
  logout: async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    await authService.logout(token);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    return ApiResponse.success(res, 'Logged out successfully.');
  },

  /**
   * Get active user handler.
   */
  me: async (req, res) => {
    const userResponse = { ...req.user };
    delete userResponse.password;
    return ApiResponse.success(res, 'Current user profile fetched.', userResponse);
  },

  /**
   * Token refresh handler.
   */
  refresh: async (req, res) => {
    // Check in cookie or request body
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const { accessToken, refreshToken } = await authService.refreshToken(token);

    // Set cookies again
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return ApiResponse.success(res, 'Token refreshed successfully.', { accessToken });
  },
};

module.exports = authController;
