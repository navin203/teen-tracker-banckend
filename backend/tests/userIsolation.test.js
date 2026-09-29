import request from 'supertest';
import app from '../src/app.js';
import { DEMO_USER_ID, DEMO_USER_ID_B } from '../src/config/db.js';

describe('Multi-Tenant User Isolation & Row Level Security (RLS)', () => {
  const tokenUserA = 'Bearer demo-token-user-a';
  const tokenUserB = 'Bearer demo-token-user-b';

  let userBExpenseId = null;

  beforeAll(async () => {
    // Create an expense owned strictly by User B
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', tokenUserB)
      .set('x-test-user-id', DEMO_USER_ID_B)
      .send({
        title: 'Private Journal of User B',
        amount: 399,
        category: 'Education',
        expense_date: '2026-09-28',
        payment_method: 'Cash',
      });

    userBExpenseId = res.body.data.id;
    expect(userBExpenseId).toBeDefined();
  });

  it("User A cannot see User B's expense in general list", async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', tokenUserA)
      .set('x-test-user-id', DEMO_USER_ID);

    expect(res.status).toBe(200);
    const expenses = res.body.data.expenses;
    const foundUserBExpense = expenses.find((e) => e.id === userBExpenseId || e.title === 'Private Journal of User B');
    expect(foundUserBExpense).toBeUndefined();
  });

  it("User A receives 404/unauthorized when requesting User B's expense by ID", async () => {
    const res = await request(app)
      .get(`/api/expenses/${userBExpenseId}`)
      .set('Authorization', tokenUserA)
      .set('x-test-user-id', DEMO_USER_ID);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("User A cannot update User B's expense", async () => {
    const res = await request(app)
      .put(`/api/expenses/${userBExpenseId}`)
      .set('Authorization', tokenUserA)
      .set('x-test-user-id', DEMO_USER_ID)
      .send({
        title: 'Hacked by User A',
        amount: 1,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    // Verify User B's expense remained unchanged
    const verifyRes = await request(app)
      .get(`/api/expenses/${userBExpenseId}`)
      .set('Authorization', tokenUserB)
      .set('x-test-user-id', DEMO_USER_ID_B);

    expect(verifyRes.body.data.title).toBe('Private Journal of User B');
  });

  it("User A cannot delete User B's expense", async () => {
    const res = await request(app)
      .delete(`/api/expenses/${userBExpenseId}`)
      .set('Authorization', tokenUserA)
      .set('x-test-user-id', DEMO_USER_ID);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    // Verify it still exists for User B
    const verifyRes = await request(app)
      .get(`/api/expenses/${userBExpenseId}`)
      .set('Authorization', tokenUserB)
      .set('x-test-user-id', DEMO_USER_ID_B);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.id).toBe(userBExpenseId);
  });
});
