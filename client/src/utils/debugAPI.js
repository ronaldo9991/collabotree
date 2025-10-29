/**
 * Debug API Utility
 * Helps debug API calls and responses
 */

export const debugAPI = {
  logRequest: (url, options) => {
    console.log('🔍 API Request:', {
      url,
      method: options?.method || 'GET',
      headers: options?.headers,
      body: options?.body
    });
  },

  logResponse: (url, response, data) => {
    console.log('📦 API Response:', {
      url,
      status: response?.status,
      success: response?.ok,
      data: data
    });
  },

  logError: (url, error) => {
    console.error('❌ API Error:', {
      url,
      error: error.message,
      stack: error.stack
    });
  }
};

export const testAPIEndpoints = async () => {
  const baseURL = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';
  
  console.log('🧪 Testing API Endpoints...');
  
  const endpoints = [
    '/health',
    '/public/services',
    '/public/top-selections'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`);
      const data = await response.json();
      
      console.log(`✅ ${endpoint}:`, {
        status: response.status,
        success: response.ok,
        dataLength: Array.isArray(data) ? data.length : 
                   data?.data ? (Array.isArray(data.data) ? data.data.length : 'object') : 
                   'no data'
      });
    } catch (error) {
      console.error(`❌ ${endpoint}:`, error.message);
    }
  }
};














