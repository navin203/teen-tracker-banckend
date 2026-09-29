import request from 'supertest';
import app from '../src/app.js';

describe('Expenses API & Validation', () => {
  const authHeader = 'Bearer demo-token';

  it('should reject expense creation when amount is <= 0 or invalid', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', authHeader)
      .send({
        title: 'Invalid Negative Expense',
        amount: -50,
        category: 'Food',
        expense_date: '2026-09-28',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some((e) => e.field === 'amount')).toBe(true);
  });

  it('should reject expense creation when title is empty', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', authHeader)
      .send({
        title: '   ',
        amount: 100,
        category: 'Food',
        expense_date: '2026-09-28',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('should successfully create an expense with valid payload', async () => {
    const newExpense = {
      title: 'Coding Book for Class',
      amount: 450,
      category: 'Education',
      expense_date: '2026-09-28',
      payment_method: 'UPI',
      description: 'Bought for Python computer science module',
    };

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', authHeader)
      .send(newExpense);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe(newExpense.title);
    expect(Number(res.body.data.amount)).toBe(450);
  });

  it('should retrieve list of expenses with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/expenses?page=1&limit=5')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.expenses)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(5);
  });

  it('should update an existing expense', async () => {
    // First create one
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', authHeader)
      .send({
        title: 'Snack to Update',
        amount: 80,
        category: 'Food',
        expense_date: '2026-09-28',
      });

    const expenseId = createRes.body.data.id;

    // Update it
    const updateRes = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', authHeader)
      .send({
        title: 'Updated Snack with Soda',
        amount: 120,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Updated Snack with Soda');
    expect(Number(updateRes.body.data.amount)).toBe(120);
  });

  it('should delete an existing expense', async () => {
    // Create one
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', authHeader)
      .send({
        title: 'Temporary Item',
        amount: 50,
        category: 'Other',
        expense_date: '2026-09-28',
      });

    const expenseId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', authHeader);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Verify it is gone
    const getRes = await request(app)
      .get(`/api/expenses/${expenseId}`)
      .set('Authorization', authHeader);

    expect(getRes.status).toBe(404);
  });
});
