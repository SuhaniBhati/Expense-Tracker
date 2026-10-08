const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Normalize so a trailing slash or an accidental "/api/v1" suffix in
// VITE_API_URL can never produce "//api/v1/..." or "/api/v1/api/v1/...".
export const BASE_URL = rawBaseUrl
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");

export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    SIGNUP: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
    UPDATE_PROFILE: "/api/v1/auth/update-profile",
  },

  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
  },

  INCOME: {
    ADD_INCOME: "/api/v1/income/add",
    GET_ALL_INCOME: "/api/v1/income/get",
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DOWNLOAD_INCOME: "/api/v1/income/downloadexcel",
  },

  EXPENSE: {
    ADD_EXPENSE: "/api/v1/expense/add",
    GET_ALL_EXPENSE: "/api/v1/expense/get",
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DOWNLOAD_EXPENSE: "/api/v1/expense/downloadexcel",
  },

  BUDGET: {
    GET_BUDGET: "/api/v1/budget",
    SET_BUDGET: "/api/v1/budget/set",
  },
};