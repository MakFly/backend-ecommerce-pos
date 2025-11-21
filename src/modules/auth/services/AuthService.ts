import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { User, LoginDto, RegisterDto, AuthTokens, JWTPayload } from '../models/Auth.js';

export class AuthService {
  async register(dto: RegisterDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user: User = {
      id: nanoid(),
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to DB (TODO: add repository)
    return user;
  }

  async login(dto: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    // Get user from DB (TODO: add repository)
    const user: User = {
      id: 'user-1',
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 12),
      firstName: 'John',
      lastName: 'Doe',
      roles: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as JWTPayload;

      // Get user from DB
      const user: User = {
        id: payload.userId,
        email: payload.email,
        passwordHash: '',
        firstName: '',
        lastName: '',
        roles: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private generateTokens(user: User): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  }
}
