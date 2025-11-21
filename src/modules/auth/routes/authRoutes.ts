import { Hono } from 'hono';
import { AuthService } from '../service/AuthService.js';
import { authenticate } from '@shared/middleware/auth.js';

const authRoutes = new Hono();
const authService = new AuthService();

// POST /auth/register
authRoutes.post('/register', async (c) => {
  const { email, password, firstName, lastName } = await c.req.json();

  const user = await authService.register(email, password, firstName, lastName);

  return c.json(
    {
      data: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
    201
  );
});

// POST /auth/login
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  const { user, tokens } = await authService.login(email, password);

  return c.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

// POST /auth/refresh
authRoutes.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json();

  const tokens = await authService.refreshTokens(refreshToken);

  return c.json({
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

// POST /auth/logout
authRoutes.post('/logout', authenticate(), async (c) => {
  const user = c.get('user');
  await authService.logout(user.userId);

  return c.json({ message: 'Logged out successfully' });
});

// GET /auth/me
authRoutes.get('/me', authenticate(), async (c) => {
  const user = c.get('user');

  return c.json({
    data: {
      userId: user.userId,
      email: user.email,
      roles: user.roles,
    },
  });
});

export { authRoutes };
