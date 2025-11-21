import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { User, Role, LoginDto, RegisterDto, AuthTokens, JWTPayload } from '../models/Auth.js';
import { IUserRepository, IRoleRepository } from '../repositories/IAuthRepository.js';

/**
 * Auth Service
 *
 * SOLID Principles:
 * - Single Responsibility: Authentication and authorization logic only
 * - Dependency Inversion: Depends on repository abstractions
 */
export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly roleRepo: IRoleRepository
  ) {}

  async register(dto: RegisterDto): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user exists
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Get default role
    let defaultRole = await this.roleRepo.findByName('user');
    if (!defaultRole) {
      // Create default role if it doesn't exist
      defaultRole = {
        id: nanoid(),
        name: 'user',
        description: 'Basic user role',
        permissions: [],
        isActive: true,
        createdAt: new Date(),
      };
      await this.roleRepo.save(defaultRole);
    }

    const user: User = {
      id: nanoid(),
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      roles: [defaultRole],
      isActive: true,
      emailVerified: false,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userRepo.save(user);

    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me'
      ) as JWTPayload;

      const user = await this.userRepo.findById(payload.userId);

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async listUsers(filters?: { isActive?: boolean; limit?: number }): Promise<User[]> {
    return this.userRepo.findAll(filters);
  }

  async listRoles(filters?: { isActive?: boolean }): Promise<Role[]> {
    return this.roleRepo.findAll(filters);
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret-change-me') as JWTPayload;
  }

  private generateTokens(user: User): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret-change-me',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
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
}
