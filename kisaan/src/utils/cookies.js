/**
 * Cookie Utility Functions
 * Handles all cookie operations for authentication tokens
 */

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration in days (default 7)
 */
export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

/**
 * Get a cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};

/**
 * Delete a cookie
 * @param {string} name - Cookie name
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean}
 */
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};

// Token-specific helpers
export const TOKEN_KEY = "auth_token";

export const setAuthToken = (token, days = 7) => {
  setCookie(TOKEN_KEY, token, days);
};

export const getAuthToken = () => {
  return getCookie(TOKEN_KEY);
};

export const removeAuthToken = () => {
  deleteCookie(TOKEN_KEY);
};

export const hasAuthToken = () => {
  return hasCookie(TOKEN_KEY);
};
