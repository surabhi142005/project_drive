/**
 * RetainStream API Client
 * Frontend integration with backend API
 */

class RetainStreamAPI {
  constructor(baseURL = 'http://localhost:5000/api', token = null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  // Auth Methods
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async register(email, password, name) {
    return this.post('/auth/register', { email, password, name });
  }

  // Dashboard Methods
  async getDashboardMetrics() {
    return this.get('/dashboard/metrics');
  }

  async getChurnDistribution() {
    return this.get('/dashboard/distribution');
  }

  async getTopFeatures() {
    return this.get('/dashboard/features');
  }

  async runPredictions(sampleSize = 100) {
    return this.post('/dashboard/predict', { sample_size: sampleSize });
  }

  // Customer Methods
  async getHighRiskCustomers(page = 1, limit = 10) {
    return this.get(`/customers/high-risk?page=${page}&limit=${limit}`);
  }

  async getCustomer(customerId) {
    return this.get(`/customers/${customerId}`);
  }

  async segmentCustomers() {
    return this.post('/customers/segment', {});
  }

  // Predictions Methods
  async getPredictionResults() {
    return this.get('/predictions/results');
  }

  async generatePredictions(sampleSize = 100) {
    return this.post('/predictions/generate', { sample_size: sampleSize });
  }

  async getModelPerformance() {
    return this.get('/predictions/performance');
  }

  // Model Methods
  async getModelStatus() {
    return this.get('/model/status');
  }

  async trainModel() {
    return this.post('/model/train', {});
  }

  async getFeatureImportance() {
    return this.get('/model/features');
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, 'GET', null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, 'POST', data, options);
  }

  async request(endpoint, method, data, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('retainstream_token', token);
  }

  getToken() {
    return this.token || localStorage.getItem('retainstream_token');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('retainstream_token');
  }
}

// Usage Example in HTML
/*
<script src="api-client.js"></script>
<script>
  const api = new RetainStreamAPI();

  // Login
  async function handleLogin() {
    const result = await api.login('alex.chen@netflix.com', 'password');
    api.setToken(result.data.token);
    loadDashboard();
  }

  // Load Dashboard
  async function loadDashboard() {
    const metrics = await api.getDashboardMetrics();
    updateMetricsDisplay(metrics.data);
  }

  // Run Predictions
  async function runPredictions() {
    const result = await api.runPredictions(100);
    console.log('Predictions generated:', result.data);
  }
</script>
*/

export default RetainStreamAPI;
