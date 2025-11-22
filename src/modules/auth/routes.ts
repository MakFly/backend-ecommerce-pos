import { Hono } from 'hono';
import { IDatabase } from '@shared/interfaces/IDatabase.js';
import { UserRepository } from './repositories/UserRepository.js';
import { RoleRepository } from './repositories/RoleRepository.js';
import { AuthService } from './services/AuthService.js';
import { authMiddleware } from '@shared/middleware/authMiddleware.js';
import { validate } from '@shared/middleware/validationMiddleware.js';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '@shared/validation/schemas.js';

/**
 * Auth Routes
 *
 * REST API for authentication and authorization
 */
export function createAuthRoutes(database: IDatabase) {
  const app = new Hono();

  // Initialize repositories and service
  const userRepo = new UserRepository(database);
  const roleRepo = new RoleRepository(database);
  const authService = new AuthService(userRepo, roleRepo);

  /**
   * POST /register
   * Register a new user
   */
  app.post('/register', validate(RegisterSchema), async (c) => {
    try {
      const body = c.get('validatedData');
      const result = await authService.register(body);
      return c.json(result, 201);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  });

  /**
   * POST /login
   * Login a user
   */
  app.post('/login', validate(LoginSchema), async (c) => {
    try {
      const body = c.get('validatedData');
      const result = await authService.login(body);
      return c.json(result);
    } catch (error: any) {
      return c.json({ error: error.message }, 401);
    }
  });

  /**
   * POST /refresh
   * Refresh access token
   */
  app.post('/refresh', validate(RefreshTokenSchema), async (c) => {
    try {
      const body = c.get('validatedData');
      const tokens = await authService.refreshToken(body.refreshToken);
      return c.json(tokens);
    } catch (error: any) {
      return c.json({ error: error.message }, 401);
    }
  });

  /**
   * GET /me
   * Get current user (requires authentication)
   */
  app.get('/me', authMiddleware, async (c) => {
    const jwtPayload = c.get('user');
    const userId = jwtPayload.userId;

    try {
      const user = await authService.getUserById(userId);
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = user;
      return c.json({ user: userWithoutPassword });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  });

  /**
   * GET /users
   * List all users (admin only)
   */
  app.get('/users', async (c) => {
    const isActive = c.req.query('isActive');
    const limit = c.req.query('limit');

    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (limit) filters.limit = parseInt(limit);

    const users = await authService.listUsers(filters);

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);

    return c.json({ users: usersWithoutPasswords });
  });

  /**
   * GET /roles
   * List all roles
   */
  app.get('/roles', async (c) => {
    const isActive = c.req.query('isActive');
    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const roles = await authService.listRoles(filters);
    return c.json({ roles });
  });

  return app;
}
