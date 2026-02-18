const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL + '/api';

export const initiateGoogleAuth = () => {
  console.log('Initiating Google OAuth flow...', { API_BASE_URL });

  const authUrl = `${API_BASE_URL}/auth/google`;
  window.location.href = authUrl;
};

export const handleOAuthCallback = (callback: (token: string, user: any) => void) => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('access_token');
  const userParam = params.get('user');

  if (token && userParam) {
    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      callback(token, user);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Failed to parse OAuth callback:', error);
    }
  }

  const storedToken = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('user');
  if (storedToken && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      callback(storedToken, user);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    }
  }
};
