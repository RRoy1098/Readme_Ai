import axios from 'axios';

const TOKEN_KEY = 'readmeai_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally (token expired, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('readmeai_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerUser(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

// ── Repository ──
export async function analyzeRepository(githubUrl) {
  const { data } = await api.post('/repository/analyze', { githubUrl });
  return data;
}

export async function getRepository(id) {
  const { data } = await api.get(`/repository/${id}`);
  return data;
}

export async function listUserRepositories() {
  const { data } = await api.get('/repository');
  return data;
}

// ── README ──
export async function generateReadme(repositoryId) {
  const { data } = await api.post('/readme/generate', { repositoryId });
  return data;
}

export async function getReadme(repositoryId) {
  const { data } = await api.get(`/readme/${repositoryId}`);
  return data;
}

export async function listUserReadmes() {
  const { data } = await api.get('/readme');
  return data;
}

export async function downloadReadme(repositoryId) {
  const response = await api.get(`/readme/${repositoryId}/download`, {
    responseType: 'blob',
  });
  return response;
}

// ── Chat ──
export async function askQuestion(repositoryId, question) {
  const { data } = await api.post('/chat', { repositoryId, question });
  return data;
}

// ── Semantic Search ──
export async function semanticSearch(repositoryId, query) {
  const { data } = await api.post('/search', { repositoryId, query });
  return data;
}

export default api;
