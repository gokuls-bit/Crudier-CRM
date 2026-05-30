/**
 * ============================================================
 * Crudier CRM — Auth Controller (Clerk Upgrade)
 * ============================================================
 */

const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');

const authController = {
  /**
   * Registration
   */
  register: async (req, res) => {
    const user = await authService.register(req.body);
    return ApiResponse.success(res, 'Registration successful.', user, 201);
  },

  /**
   * Login
   */
  login: async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    const result = await authService.login(email, password, ip, userAgent);

    if (result.mfaRequired) {
      return ApiResponse.success(res, '2FA authentication required.', {
        mfaRequired: true,
        tempToken: result.tempToken,
      });
    }

    const { user, accessToken, refreshToken, sessionId } = result;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    return ApiResponse.success(res, 'Login successful.', { user, accessToken, sessionId });
  },

  /**
   * Logout
   */
  logout: async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    await authService.logout(token);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    return ApiResponse.success(res, 'Logged out successfully.');
  },

  /**
   * Current user profile
   */
  me: async (req, res) => {
    const userResponse = { ...req.user };
    delete userResponse.password;
    delete userResponse.twoFactorSecret;
    return ApiResponse.success(res, 'Current user profile fetched.', userResponse);
  },

  /**
   * Token refresh
   */
  refresh: async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const tokens = await authService.refreshToken(token);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return ApiResponse.success(res, 'Token refreshed successfully.', { accessToken: tokens.accessToken });
  },

  /**
   * OAuth Simulator endpoints
   */
  oauthInitiate: async (req, res) => {
    const { provider } = req.params;
    const redirectUri = req.query.redirect_uri || 'http://localhost:3000/oauth/callback';
    const mockAuthUrl = `${redirectUri}?code=mock_code_123&provider=${provider}`;
    return res.redirect(mockAuthUrl);
  },

  oauthCallback: async (req, res) => {
    const { provider } = req.params;
    const { code } = req.query;
    
    if (!code) {
      throw new ApiError('OAuth callback failed: Code is missing.', 400);
    }

    const email = (provider === 'google' || provider === 'gmail')
      ? `mock_${provider}_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`
      : `mock_${provider}_${Math.floor(1000 + Math.random() * 9000)}@crm.local`;
    const name = `Mock ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    const providerId = `mock_id_${Math.floor(100000 + Math.random() * 900000)}`;

    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    const { user, accessToken, refreshToken, sessionId } = await authService.oauthCallback(
      provider,
      providerId,
      email,
      name,
      ip,
      userAgent
    );

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

    return ApiResponse.success(res, 'OAuth authentication successful.', { user, accessToken, sessionId });
  },

  linkOAuth: async (req, res) => {
    const { provider } = req.params;
    const { providerId } = req.body;
    const userId = req.user._id;

    await authService.linkOAuth(userId, provider, providerId || `mock_link_${Date.now()}`);
    return ApiResponse.success(res, `OAuth provider ${provider} linked successfully.`);
  },

  unlinkOAuth: async (req, res) => {
    const { provider } = req.params;
    const userId = req.user._id;

    await authService.unlinkOAuth(userId, provider);
    return ApiResponse.success(res, `OAuth provider ${provider} unlinked successfully.`);
  },

  /**
   * TOTP / 2FA endpoints
   */
  setup2FA: async (req, res) => {
    const userId = req.user._id;
    const result = await authService.setup2FA(userId);
    return ApiResponse.success(res, '2FA setup details generated.', result);
  },

  verify2FA: async (req, res) => {
    const { code } = req.body;
    const userId = req.user._id;

    const result = await authService.verify2FA(userId, code);
    return ApiResponse.success(res, '2FA has been successfully verified and enabled.', result);
  },

  validate2FA: async (req, res) => {
    const { tempToken, code } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    const { user, accessToken, refreshToken, sessionId } = await authService.validate2FA(
      tempToken,
      code,
      ip,
      userAgent
    );

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

    return ApiResponse.success(res, '2FA validation successful.', { user, accessToken, sessionId });
  },

  regenerateBackupCodes: async (req, res) => {
    const userId = req.user._id;
    const result = await authService.regenerateBackupCodes(userId);
    return ApiResponse.success(res, 'Backup codes successfully regenerated.', result);
  },

  /**
   * Session endpoints
   */
  getSessions: async (req, res) => {
    const userId = req.user._id;
    const sessions = await authService.getSessions(userId);
    return ApiResponse.success(res, 'Active sessions list retrieved.', sessions);
  },

  revokeSession: async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    await authService.revokeSession(userId, id);
    return ApiResponse.success(res, 'Active session revoked.');
  },

  /**
   * Developer profile endpoints
   */
  getDeveloperProfiles: async (req, res) => {
    const userId = req.user._id;
    const profiles = await authService.getDeveloperProfiles(userId);
    return ApiResponse.success(res, 'Developer profiles retrieved.', profiles);
  },

  syncDeveloperProfiles: async (req, res) => {
    const userId = req.user._id;
    const profiles = await authService.syncDeveloperProfiles(userId);
    return ApiResponse.success(res, 'Developer profiles synced.', profiles);
  },
};

module.exports = authController;
