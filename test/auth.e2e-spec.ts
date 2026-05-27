import { INestApplication } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import request, { type Response } from 'supertest';
import { createTestApp } from './create-test-app';

type HttpServer = Parameters<typeof request>[0];

function getServer(app: INestApplication): HttpServer {
  return app.getHttpServer() as HttpServer;
}

const PNG_IMAGE_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgQWGWpQAAAAASUVORK5CYII=',
  'base64',
);

async function loginAndGetCookies(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string[]> {
  const response = await request(getServer(app)).post('/auth/login').send({
    email,
    password,
  });

  expect(response.status).toBe(201);
  expect(response.headers['set-cookie']).toEqual(
    expect.arrayContaining([
      expect.stringContaining('access_token='),
      expect.stringContaining('refresh_token='),
    ]),
  );

  return response.headers['set-cookie'] as string[];
}

describe('Auth and Access (e2e)', () => {
  let app: INestApplication;
  let adminCookies: string[];
  let realtorCookies: string[];

  beforeAll(async () => {
    app = await createTestApp();
    adminCookies = await loginAndGetCookies(app, 'admin@example.com', 'admin123');
    realtorCookies = await loginAndGetCookies(
      app,
      'anarealtor@example.com',
      '123456',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / returns the health check response', async () => {
    await request(getServer(app)).get('/').expect(200).expect('Hello World!');
  });

  it('POST /users/register creates a public client user', async () => {
    const email = `client-${Date.now()}@example.com`;

    const response = await request(getServer(app))
      .post('/users/register')
      .send({
        name: 'Cliente E2E',
        email,
        phone: '11999999999',
        password: 'Senha@123',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Cliente E2E',
      email,
      phone: '11999999999',
      role: UserRole.CLIENT,
      emailVerificationRequired: true,
    });
    expect(response.body).not.toHaveProperty('password');
  });

  it('POST /users/verify-email/request and /confirm verifies a public e-mail', async () => {
    const email = `verify-${Date.now()}@example.com`;

    await request(getServer(app))
      .post('/users/register')
      .send({
        name: 'Cliente Verify',
        email,
        password: 'Senha@123',
      })
      .expect(201);

    const requestVerificationResponse = await request(getServer(app))
      .post('/users/verify-email/request')
      .send({ email })
      .expect(201);

    expect(requestVerificationResponse.body).toHaveProperty(
      'verificationToken',
    );

    await request(getServer(app))
      .post('/users/verify-email/confirm')
      .send({
        token: requestVerificationResponse.body.verificationToken as string,
      })
      .expect(201)
      .expect({
        message: 'E-mail verificado com sucesso.',
      });
  });

  it('POST /users/forgot-password/request and /confirm resets the password and invalidates sessions', async () => {
    const email = `reset-${Date.now()}@example.com`;
    const originalPassword = 'Senha@123';
    const newPassword = 'NovaSenha@123';

    await request(getServer(app))
      .post('/users/register')
      .send({
        name: 'Cliente Reset',
        email,
        password: originalPassword,
      })
      .expect(201);

    const requestResetResponse = await request(getServer(app))
      .post('/users/forgot-password/request')
      .send({ email })
      .expect(201);

    expect(requestResetResponse.body).toHaveProperty('resetToken');

    const userCookies = await loginAndGetCookies(app, email, originalPassword);

    await request(getServer(app))
      .post('/users/forgot-password/confirm')
      .send({
        token: requestResetResponse.body.resetToken as string,
        newPassword,
      })
      .expect(201)
      .expect({
        message: 'Senha redefinida com sucesso.',
      });

    await request(getServer(app))
      .get('/users/me')
      .set('Cookie', userCookies)
      .expect(401);

    await loginAndGetCookies(app, email, newPassword);
  });

  it('POST /auth/login sets cookies and GET /users/me reads the session', async () => {
    const profileResponse = await request(getServer(app))
      .get('/users/me')
      .set('Cookie', adminCookies)
      .expect(200);

    expect(profileResponse.body).toMatchObject({
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      name: 'Admin',
    });
    expect(profileResponse.body).not.toHaveProperty('password');
  });

  it('POST /auth/logout clears only the current session', async () => {
    const currentSessionCookies = await loginAndGetCookies(
      app,
      'admin@example.com',
      'admin123',
    );
    const otherSessionCookies = await loginAndGetCookies(
      app,
      'admin@example.com',
      'admin123',
    );

    await request(getServer(app))
      .get('/users/me')
      .set('Cookie', currentSessionCookies)
      .expect(200);

    const logoutResponse: Response = await request(getServer(app))
      .post('/auth/logout')
      .set('Cookie', currentSessionCookies)
      .expect(201);

    expect(logoutResponse.body).toEqual({
      message: 'logged out from current session',
    });
    expect(logoutResponse.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('access_token='),
        expect.stringContaining('refresh_token='),
      ]),
    );

    await request(getServer(app))
      .get('/users/me')
      .set('Cookie', logoutResponse.headers['set-cookie'] as string[])
      .expect(401);

    await request(getServer(app))
      .get('/users/me')
      .set('Cookie', otherSessionCookies)
      .expect(200);
  });

  it('POST /auth/logout-all invalidates all sessions', async () => {
    const firstSessionCookies = await loginAndGetCookies(
      app,
      'admin@example.com',
      'admin123',
    );
    const secondSessionCookies = await loginAndGetCookies(
      app,
      'admin@example.com',
      'admin123',
    );

    await request(getServer(app))
      .post('/auth/logout-all')
      .set('Cookie', firstSessionCookies)
      .expect(201)
      .expect({
        message: 'logged out from all sessions',
      });

    await request(getServer(app))
      .get('/users/me')
      .set('Cookie', secondSessionCookies)
      .expect(401);

    adminCookies = await loginAndGetCookies(app, 'admin@example.com', 'admin123');
  });

  it('PATCH /users/me/avatar uploads a user avatar safely', async () => {
    const response = await request(getServer(app))
      .patch('/users/me/avatar')
      .set('Cookie', adminCookies)
      .attach('avatar', PNG_IMAGE_BUFFER, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      email: 'admin@example.com',
      avatar: expect.stringMatching(/^\/uploads\/avatars\/.+\.png$/),
    });

    await request(getServer(app)).get(response.body.avatar as string).expect(200);
  });

  it('allows ADMIN to access GET /admin/users', async () => {
    const response = await request(getServer(app))
      .get('/admin/users')
      .set('Cookie', adminCookies)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const users = response.body as unknown[];
    expect(users.length).toBeGreaterThan(0);
  });

  it('blocks unauthenticated access to GET and POST /admin/users', async () => {
    await request(getServer(app)).get('/admin/users').expect(401);

    await request(getServer(app))
      .post('/admin/users')
      .send({
        name: 'Admin no auth',
        email: `no-auth-${Date.now()}@example.com`,
        password: 'Senha@123',
        role: UserRole.ADMIN,
      })
      .expect(401);
  });

  it('POST /admin/property/:id/images uploads property images for admins', async () => {
    const response = await request(getServer(app))
      .post('/admin/property/1/images')
      .set('Cookie', adminCookies)
      .attach('images', PNG_IMAGE_BUFFER, {
        filename: 'front.png',
        contentType: 'image/png',
      })
      .attach('images', PNG_IMAGE_BUFFER, {
        filename: 'kitchen.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id', '1');
    expect(response.body.images).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^\/uploads\/properties\/.+\.png$/),
      ]),
    );
  });

  it('blocks REALTOR from accessing GET /admin/users', async () => {
    await request(getServer(app))
      .get('/admin/users')
      .set('Cookie', realtorCookies)
      .expect(403);
  });

  it('blocks REALTOR from creating admin users', async () => {
    await request(getServer(app))
      .post('/admin/users')
      .set('Cookie', realtorCookies)
      .send({
        name: 'Nope',
        email: `realtor-blocked-${Date.now()}@example.com`,
        password: 'Senha@123',
        role: UserRole.ADMIN,
      })
      .expect(403);
  });

  it('blocks role changes through PATCH /users/me', async () => {
    await request(getServer(app))
      .patch('/users/me')
      .set('Cookie', adminCookies)
      .send({
        role: UserRole.CLIENT,
      })
      .expect(400);
  });
});
