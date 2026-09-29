import request from 'supertest';
import app from '../src/app.js';

describe('Analytics & Spending Insights', () => {
  const authHeader = 'Bearer demo-token';

  it('should return complete dashboard summary with all 8 metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.todaySpending).toBeDefined();
    expect(data.weeklySpending).toBeDefined();
    expect(data.totalSpentThisMonth).toBeDefined();
    expect(data.overallBudget).toBeDefined();
    expect(data.remainingMonthlyBudget).toBeDefined();
    expect(data.budgetProgressPercentage).toBeDefined();
    expect(data.highestCategory).toBeDefined();
    expect(data.transactionCount).toBeDefined();
    expect(Array.isArray(data.recentExpenses)).toBe(true);
  });

  it('should return category breakdown for charts', async () => {
    const res = await request(app)
      .get('/api/analytics/categories')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  it('should generate rule-based smart insights', async () => {
    const res = await request(app)
      .get('/api/insights')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.insights)).toBe(true);
    expect(res.body.data.insights.length).toBeGreaterThan(0);
    expect(res.body.data.insights[0].tip).toBeDefined();
  });
});
