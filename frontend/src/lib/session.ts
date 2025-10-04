// Session utility for managing guest cart sessions
export const getSessionId = (): string => {
  const STORAGE_KEY = 'guest_session_id';

  if (typeof window === 'undefined') {
    return '';
  }

  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    // Generate a new session ID
    sessionId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
};

export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('guest_session_id');
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!localStorage.getItem('token');
};

export const getAuthHeaders = () => {
  const headers: any = {};

  if (isAuthenticated()) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } else {
    headers['session-id'] = getSessionId();
  }

  return headers;
};