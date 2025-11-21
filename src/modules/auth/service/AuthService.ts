import jwt from 'jsonwebtoken';
import { User } from '../domain/User.js';
import { UnauthorizedError } from '@shared/errors/AppError.js';
import { getRedis } from '@core/infrastructure/redis.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<User> {
    const user = await User.create(email, password, firstName, lastName, ['CUSTOMER']);
    // Save to database would happen here
    return user;
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    // In real implementation, fetch user from database
    // For now, mock user
    const user = await User.create(email, password, 'John', 'Doe', ['ADMIN', 'STAFF']);

    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    user.recordLogin();

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async generateTokens(user: User): Promise<AuthTokens> {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Store refresh token in Redis
    const redis = getRedis();
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
      };

      const redis = getRedis();
      const storedToken = await redis.get(`refresh_token:${payload.userId}`);

      if (storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // In real implementation, fetch user from database
      const user = User.reconstitute(
        {
          email: 'user@example.com',
          passwordHash: 'hash',
          firstName: 'John',
          lastName: 'Doe',
          roles: ['CUSTOMER'],
          isActive: true,
        },
        payload.userId
      );

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    const redis = getRedis();
    await redis.del(`refresh_token:${userId}`);
  }
}
