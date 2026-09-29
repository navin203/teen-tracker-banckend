import request from 'supertest';
import app from '../src/app.js';

describe('Authentication & Security Middleware', () => {
  it('should return 401 Unauthorized when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/token missing/i);
  });

  it('should return 401 Unauthorized when malformed Bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', 'Basic 12345');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow access and return profile when valid token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer demo-token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.username).toBeDefined();
  });
});
