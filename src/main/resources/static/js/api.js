'use strict';

const API_BASE = '/api/v1';

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: STRINGS.errors.generic }));
    const err = new Error(error.message || STRINGS.errors.generic);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

const api = {
  categories: {
    // GET /api/v1/categories → [{id, name, type, displayOrder, subcategories}]
    list: () =>
      apiFetch('/categories'),
  },

  transactions: {
    // GET /api/v1/transactions?year=&month= → [{id, date, amount, description, subcategoryId, subcategoryName, createdAt, updatedAt}]
    list: (year, month) =>
      apiFetch(`/transactions?year=${year}&month=${month}`),

    // GET /api/v1/transactions/{id}
    get: (id) =>
      apiFetch(`/transactions/${id}`),

    // POST /api/v1/transactions  body: {date, amount, description, subcategoryId}
    create: (data) =>
      apiFetch('/transactions', { method: 'POST', body: JSON.stringify(data) }),

    // PUT /api/v1/transactions/{id}  body: {date, amount, description, subcategoryId}
    update: (id, data) =>
      apiFetch(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // DELETE /api/v1/transactions/{id}  → 204
    delete: (id) =>
      apiFetch(`/transactions/${id}`, { method: 'DELETE' }),
  },

  summary: {
    // GET /api/v1/summary?year=&month= → {totalIncome, totalExpenses, balance, categoryBreakdown}
    get: (year, month) =>
      apiFetch(`/summary?year=${year}&month=${month}`),
  },

  budgets: {
    // GET /api/v1/budgets?year=&month= → [{id, year, month, subcategoryId, subcategoryName, categoryId, categoryName, projectedAmount}]
    list: (year, month) =>
      apiFetch(`/budgets?year=${year}&month=${month}`),

    // PUT /api/v1/budgets/{year}/{month}/{subcategoryId}  body: {projectedAmount}
    upsert: (year, month, subcategoryId, projectedAmount) =>
      apiFetch(`/budgets/${year}/${month}/${subcategoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ projectedAmount }),
      }),

    // POST /api/v1/budgets/{year}/{month}/fill-blanks → [{...}]
    fillBlanks: (year, month) =>
      apiFetch(`/budgets/${year}/${month}/fill-blanks`, { method: 'POST' }),
  },
};
