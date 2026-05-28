/**
 * ============================================================
 * Crudier CRM — Auth Service (Clerk Upgrade)
 * ============================================================
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../../../config/env');
const ApiError = require('../../utils/apiError');
const authRepository = require('./auth.repository');
const generateTokens = require('../../utils/generateToken');
const { verifyTOTP, generateSecret, generateOtpauthUrl } = require('../../utils/totp');
const { encrypt, decrypt } = require('../../utils/encryption');

// Helper to parse user agents into device & browser info
const parseUserAgent = (ua) => {
  let device = 'Desktop';
  let browser = 'Unknown Browser';

  if (!ua) return { device, browser };

  const lower = ua.toLowerCase();
  
  if (lower.includes('mobi') || lower.includes('android') || lower.includes('iphone')) {
    device = 'Mobile';
  } else if (lower.includes('tablet') || lower.includes('ipad')) {
    device = 'Tablet';
  }

  if (lower.includes('firefox')) {
    browser = 'Mozilla Firefox';
  } else if (lower.includes('chrome') && !lower.includes('chromium')) {
    browser = 'Google Chrome';
  } else if (lower.includes('safari') && !lower.includes('chrome')) {
    browser = 'Apple Safari';
  } else if (lower.includes('edge')) {
    browser = 'Microsoft Edge';
  } else if (lower.includes('opera') || lower.includes('opr')) {
    browser = 'Opera';
  } else if (lower.includes('postman')) {
    browser = 'Postman Client';
  }

  return { device, browser };
};

// Unified helper to register active login sessions, records login history logs, and issues JWT tokens
const createLoginSession = async (user, ip, userAgent, provider) => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  const { device, browser } = parseUserAgent(userAgent);
  const location = 'Local Network';
  
  const session = { sessionId, device, browser, ip, location, lastActive: new Date() };
  await authRepository.addActiveSession(user._id, session);

  const historyEntry = { ip, userAgent, timestamp: new Date(), provider };
  await authRepository.addLoginHistory(user._id, historyEntry);

  const tokens = generateTokens(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await authRepository.saveRefreshToken(user._id, tokens.refreshToken, expiresAt);

  return { sessionId, tokens };
};

const authService = {
  /**
   * Register a new user.
   */
  register: async (userData) => {
    const { name, email, password, role } = userData;

    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError('Registration failed: Email is already registered.', 400);
    }

    const validRoles = ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'];
    const assignedRole = validRoles.includes(role) ? role : 'Intern';

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const user = await authRepository.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      isActive: true,
      emailVerified: false,
    });

    delete user.password;
    return user;
  },

  /**
   * Login a user with password (with Lockout & 2FA hooks).
   */
  login: async (email, password, ip = '127.0.0.1', userAgent = '') => {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new ApiError('Login failed: Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new ApiError('Login failed: Your account is inactive.', 403);
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lockedUntil) - new Date()) / 1000 / 60);
      throw new ApiError(`Login failed: Account is temporarily locked. Try again in ${minutesLeft} minutes.`, 403);
    }

    if (!user.password) {
      throw new ApiError('Login failed: This account was registered via OAuth. Please use social sign-in.', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30-min lockout
      }
      await authRepository.incrementFailedAttempts(user._id, lockedUntil);

      if (attempts >= 5) {
        throw new ApiError('Login failed: Too many failed attempts. Your account has been locked for 30 minutes.', 403);
      } else {
        throw new ApiError(`Login failed: Invalid email or password. Attempt ${attempts} of 5.`, 401);
      }
    }

    // Reset failed login counters
    await authRepository.resetFailedAttempts(user._id);

    // Gate with 2FA if enabled
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user._id.toString(), mfaPending: true },
        env.jwtSecret,
        { expiresIn: '5m' }
      );
      return { mfaRequired: true, tempToken };
    }

    // Create session and issue tokens
    const { sessionId, tokens } = await createLoginSession(user, ip, userAgent, 'credentials');

    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.twoFactorSecret;

    return { user: userResponse, sessionId, ...tokens };
  },

  /**
   * OAuth Callback Simulator logic.
   */
  oauthCallback: async (provider, providerId, email, name, ip = '127.0.0.1', userAgent = '') => {
    let user = await authRepository.findUserByProvider(provider, providerId);

    // If not found by provider, check if a user with that email already exists
    if (!user) {
      user = await authRepository.findByEmail(email);
      if (user) {
        // Auto-link account
        const linkData = {
          provider,
          providerId,
          accessToken: encrypt('mock_oauth_access_token'),
          connectedAt: new Date(),
        };
        await authRepository.linkProvider(user._id, linkData);
      } else {
        // Create user from scratch
        user = await authRepository.createUser({
          name: name || email.split('@')[0],
          email: email.toLowerCase().trim(),
          emailVerified: true,
          authProviders: [
            {
              provider,
              providerId,
              accessToken: encrypt('mock_oauth_access_token'),
              connectedAt: new Date(),
            },
          ],
        });
      }
    }

    // Setup active session
    const { sessionId, tokens } = await createLoginSession(user, ip, userAgent, provider);

    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.twoFactorSecret;

    return { user: userResponse, sessionId, ...tokens };
  },

  /**
   * Link an OAuth provider to an active authenticated account.
   */
  linkOAuth: async (userId, provider, providerId) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);

    const isLinked = user.authProviders.some((ap) => ap.provider === provider);
    if (isLinked) {
      throw new ApiError(`OAuth link failed: ${provider} is already linked.`, 400);
    }

    const providerData = {
      provider,
      providerId,
      accessToken: encrypt('mock_linked_access_token'),
      connectedAt: new Date(),
    };

    await authRepository.linkProvider(userId, providerData);
    return true;
  },

  /**
   * Unlink an OAuth provider.
   */
  unlinkOAuth: async (userId, provider) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);

    if (user.authProviders.length <= 1 && !user.password) {
      throw new ApiError('OAuth unlink failed: You must have at least one authentication method (password or social profile).', 400);
    }

    await authRepository.unlinkProvider(userId, provider);
    return true;
  },

  /**
   * Setup 2FA secret generation.
   */
  setup2FA: async (userId) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);

    const secret = generateSecret();
    const otpauthUrl = generateOtpauthUrl(user.email, secret);
    
    // Save temporarily in db under encrypted TOTP secret field
    await authRepository.updateProfile(userId, {
      twoFactorSecret: encrypt(secret),
    });

    return { secret, otpauthUrl };
  },

  /**
   * Verify and fully enable 2FA, returning backup codes.
   */
  verify2FA: async (userId, code) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);

    if (!user.twoFactorSecret) {
      throw new ApiError('MFA setup failed: No 2FA secret found. Call setup first.', 400);
    }

    const decryptedSecret = decrypt(user.twoFactorSecret);
    const isValid = verifyTOTP(decryptedSecret, code);

    if (!isValid) {
      throw new ApiError('MFA setup failed: Invalid TOTP verification code.', 400);
    }

    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex') // e.g. "a2c4e6g8"
    );

    // Save and enable
    await authRepository.updateProfile(userId, {
      twoFactorEnabled: true,
      twoFactorBackupCodes: backupCodes, // Plain strings or hashed (plain for easy download spec)
    });

    return { backupCodes };
  },

  /**
   * Validate TOTP during 2FA gate.
   */
  validate2FA: async (tempToken, code, ip = '127.0.0.1', userAgent = '') => {
    let decoded;
    try {
      decoded = jwt.verify(tempToken, env.jwtSecret);
    } catch (e) {
      throw new ApiError('MFA validation failed: Invalid or expired temporary token.', 401);
    }

    if (!decoded.mfaPending) {
      throw new ApiError('MFA validation failed: Invalid token context.', 400);
    }

    const user = await authRepository.findById(decoded.id);
    if (!user) throw new ApiError('MFA validation failed: User not found.', 404);

    const decryptedSecret = decrypt(user.twoFactorSecret);
    let isValid = verifyTOTP(decryptedSecret, code);
    let isBackupUsed = false;

    // Check backup codes if TOTP fails
    if (!isValid && user.twoFactorBackupCodes && user.twoFactorBackupCodes.includes(code)) {
      isValid = true;
      isBackupUsed = true;
    }

    if (!isValid) {
      throw new ApiError('MFA validation failed: Invalid TOTP or backup code.', 401);
    }

    if (isBackupUsed) {
      // Remove used backup code
      const remainingBackups = user.twoFactorBackupCodes.filter((bc) => bc !== code);
      await authRepository.updateProfile(user._id, { twoFactorBackupCodes: remainingBackups });
    }

    // Successful validation! Establish active login session
    const { sessionId, tokens } = await createLoginSession(user, ip, userAgent, '2fa');

    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.twoFactorSecret;

    return { user: userResponse, sessionId, ...tokens };
  },

  /**
   * Regenerate backup codes.
   */
  regenerateBackupCodes: async (userId) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);

    if (!user.twoFactorEnabled) {
      throw new ApiError('2FA is not enabled on this account.', 400);
    }

    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex')
    );

    await authRepository.updateProfile(userId, { twoFactorBackupCodes: backupCodes });
    return { backupCodes };
  },

  /**
   * Active sessions.
   */
  getSessions: async (userId) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);
    return user.activeSessions || [];
  },

  /**
   * Revoke session.
   */
  revokeSession: async (userId, sessionId) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);
    
    await authRepository.removeActiveSession(userId, sessionId);
    return true;
  },

  /**
   * Refresh Token rotation.
   */
  refreshToken: async (token) => {
    if (!token) {
      throw new ApiError('Refresh failed: Refresh token is missing.', 401);
    }

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

      const tokens = generateTokens(user);

      await authRepository.deleteRefreshToken(token);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authRepository.saveRefreshToken(user._id, tokens.refreshToken, expiresAt);

      return tokens;
    } catch (err) {
      await authRepository.deleteRefreshToken(token);
      throw new ApiError('Refresh failed: Invalid or expired refresh token.', 401);
    }
  },

  /**
   * Logout.
   */
  logout: async (token) => {
    if (token) {
      await authRepository.deleteRefreshToken(token);
    }
  },

  /**
   * Developer profiles management.
   */
  getDeveloperProfiles: async (userId) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);
    return user.developerProfiles || {};
  },

  syncDeveloperProfiles: async (userId) => {
    const user = await authRepository.findById(userId);
    if (!user) throw new ApiError('User not found.', 404);

    const dev = user.developerProfiles || {};
    const synced = {
      github: dev.github ? { ...dev.github, stars: 18, repos: 42, syncedAt: new Date() } : { username: 'dev-user', stars: 12, repos: 34, syncedAt: new Date() },
      leetcode: dev.leetcode ? { ...dev.leetcode, solved: 154, rating: 1680, syncedAt: new Date() } : { username: 'leetcode-user', solved: 142, rating: 1650, syncedAt: new Date() },
      hackerrank: dev.hackerrank ? { ...dev.hackerrank, badges: ['Gold Problem Solving', 'Silver Python', 'Gold SQL'], syncedAt: new Date() } : { username: 'hr-user', badges: ['Gold Problem Solving', 'Silver Python'], syncedAt: new Date() },
      codeforces: dev.codeforces ? { ...dev.codeforces, rating: 1460, rank: 'Specialist', syncedAt: new Date() } : { username: 'cf-user', rating: 1420, rank: 'Specialist', syncedAt: new Date() },
      codechef: dev.codechef ? { ...dev.codechef, rating: 1580, stars: 3, syncedAt: new Date() } : { username: 'cc-user', rating: 1530, stars: 3, syncedAt: new Date() },
      stackoverflow: dev.stackoverflow ? { ...dev.stackoverflow, reputation: 324, syncedAt: new Date() } : { username: 'so-user', reputation: 256, syncedAt: new Date() },
    };

    await authRepository.updateProfile(userId, { developerProfiles: synced });
    return synced;
  },
};

module.exports = authService;
