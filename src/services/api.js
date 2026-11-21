const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const TOKEN_KEY = "personalFinanceAuthToken";
const USER_KEY = "personalFinanceAuthUser";

// Auth token helpers
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(authData) {
  if (authData?.token) {
    localStorage.setItem(TOKEN_KEY, authData.token);
  }
  if (authData) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: authData.id,
        name: authData.name,
        email: authData.email,
      })
    );
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Common API request function with Bearer token
async function apiRequest(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();

  if (!response.ok) {
    let errorMessage;
    try {
      const parsed = JSON.parse(text);
      errorMessage = parsed.message || parsed.error || text;
    } catch {
      errorMessage = text || response.statusText || "API request failed";
    }
    throw new Error(errorMessage);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Authentication APIs
export const authAPI = {
  register: async (credentials) => {
    const data = await apiRequest(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    setAuthSession(data);
    return data;
  },

  login: async (credentials) => {
    const data = await apiRequest(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    setAuthSession(data);
    return data;
  },

  me: () => apiRequest(`${API_BASE_URL}/auth/me`),

  logout: () => {
    clearAuthSession();
  },

  isAuthenticated: () => Boolean(getAuthToken()),
};

// Full Finance Overview API
export const financeAPI = {
  getAll: () => apiRequest(`${API_BASE_URL}/finance/all`),
};

// Income APIs
export const incomeAPI = {
  getAll: () => apiRequest(`${API_BASE_URL}/income`),
  getById: (id) => apiRequest(`${API_BASE_URL}/income/${id}`),
  add: (income) =>
    apiRequest(`${API_BASE_URL}/income`, {
      method: "POST",
      body: JSON.stringify(income),
    }),
  update: (id, income) =>
    apiRequest(`${API_BASE_URL}/income/${id}`, {
      method: "PUT",
      body: JSON.stringify(income),
    }),
  delete: (id) =>
    apiRequest(`${API_BASE_URL}/income/${id}`, {
      method: "DELETE",
    }),
};

// Expense APIs
export const expenseAPI = {
  getAll: () => apiRequest(`${API_BASE_URL}/expenses`),
  getById: (id) => apiRequest(`${API_BASE_URL}/expenses/${id}`),
  add: (expense) =>
    apiRequest(`${API_BASE_URL}/expenses`, {
      method: "POST",
      body: JSON.stringify(expense),
    }),
  update: (id, expense) =>
    apiRequest(`${API_BASE_URL}/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    }),
  delete: (id) =>
    apiRequest(`${API_BASE_URL}/expenses/${id}`, {
      method: "DELETE",
    }),
};

// Budget APIs
export const budgetAPI = {
  getAll: () => apiRequest(`${API_BASE_URL}/budgets`),
  save: (budget) =>
    apiRequest(`${API_BASE_URL}/budgets`, {
      method: "POST",
      body: JSON.stringify(budget),
    }),
  update: (id, budget) =>
    apiRequest(`${API_BASE_URL}/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(budget),
    }),
  delete: (id) =>
    apiRequest(`${API_BASE_URL}/budgets/${id}`, {
      method: "DELETE",
    }),
};

// Bill & EMI APIs
export const billAPI = {
  getAll: () => apiRequest(`${API_BASE_URL}/bills`),
  add: (bill) =>
    apiRequest(`${API_BASE_URL}/bills`, {
      method: "POST",
      body: JSON.stringify(bill),
    }),
  update: (id, bill) =>
    apiRequest(`${API_BASE_URL}/bills/${id}`, {
      method: "PUT",
      body: JSON.stringify(bill),
    }),
  delete: (id) =>
    apiRequest(`${API_BASE_URL}/bills/${id}`, {
      method: "DELETE",
    }),
  recordPayment: (id, payload = {}) =>
    apiRequest(`${API_BASE_URL}/bills/${id}/pay`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Savings APIs
export const savingsAPI = {
  getAllGoals: () => apiRequest(`${API_BASE_URL}/savings/goals`),
  addGoal: (goal) =>
    apiRequest(`${API_BASE_URL}/savings/goals`, {
      method: "POST",
      body: JSON.stringify(goal),
    }),
  updateGoal: (id, goal) =>
    apiRequest(`${API_BASE_URL}/savings/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(goal),
    }),
  deleteGoal: (id) =>
    apiRequest(`${API_BASE_URL}/savings/goals/${id}`, {
      method: "DELETE",
    }),
  allocateToGoal: (id, amount) =>
    apiRequest(`${API_BASE_URL}/savings/goals/${id}/allocate`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
  getAllDeposits: () => apiRequest(`${API_BASE_URL}/savings/deposits`),
  addDeposit: (deposit) =>
    apiRequest(`${API_BASE_URL}/savings/deposits`, {
      method: "POST",
      body: JSON.stringify(deposit),
    }),
};

// Calendar Notes APIs
export const calendarNotesAPI = {
  getAll: () => apiRequest(`${API_BASE_URL}/calendar-notes`),
  save: (dateKey, note) =>
    apiRequest(`${API_BASE_URL}/calendar-notes`, {
      method: "POST",
      body: JSON.stringify({ dateKey, note }),
    }),
};

// User Preferences APIs
export const preferencesAPI = {
  get: () => apiRequest(`${API_BASE_URL}/preferences`),
  update: (prefs) =>
    apiRequest(`${API_BASE_URL}/preferences`, {
      method: "PUT",
      body: JSON.stringify(prefs),
    }),
};

// Migration / Data Import API
export const migrationAPI = {
  importData: (bundle) =>
    apiRequest(`${API_BASE_URL}/migration/import`, {
      method: "POST",
      body: JSON.stringify(bundle),
    }),
};

// Reminder & Notification APIs
export const reminderAPI = {
  getAll: () => apiRequest(`${API_BASE_URL}/reminders`),
  add: (reminder) =>
    apiRequest(`${API_BASE_URL}/reminders`, {
      method: "POST",
      body: JSON.stringify(reminder),
    }),
  markRead: (id) =>
    apiRequest(`${API_BASE_URL}/reminders/${id}/read`, {
      method: "PUT",
    }),
  dismiss: (id) =>
    apiRequest(`${API_BASE_URL}/reminders/${id}`, {
      method: "DELETE",
    }),
};

