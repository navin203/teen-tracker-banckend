import request from 'supertest';
import app from '../src/app.js';

describe('Budget Calculations & Thresholds', () => {
  const authHeader = 'Bearer demo-token';
  const currentMonth = new Date().toISOString().slice(0, 7);

  it('should set and calculate monthly budget status with warning percentages', async () => {
    // Set budget
    const setRes = await request(app)
      .post('/api/budgets')
      .set('Authorization', authHeader)
      .send({
        category: 'Food',
        monthly_limit: 1000,
        month: currentMonth,
      });

    expect(setRes.status).toBe(201);
    expect(setRes.body.success).toBe(true);

    // Retrieve monthly budgets
    const getRes = await request(app)
      .get(`/api/budgets?month=${currentMonth}`)
      .set('Authorization', authHeader);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.overall).toBeDefined();
    expect(Array.isArray(getRes.body.data.category_budgets)).toBe(true);
    expect(typeof getRes.body.data.overall.percentage_used).toBe('number');
    expect(['safe', 'caution_50', 'warning_75', 'danger_90', 'exceeded_100']).toContain(
      getRes.body.data.overall.status
    );
  });
});
