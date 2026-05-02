import axios from 'axios';
import { config } from '../config/env';

const getBaseUrl = () => config.baseUrl;

const ensureAuth = async () => {
  const { authService } = await import('../services/authService');
  await authService.getAuthToken();
};

const handleApiError = (error: any, context: string) => {
  const errData = error.response?.data;
  console.error(`[API Error] ${context}:`, errData || error.message);
  
  if (errData) {
    const msg = errData.message || errData.error || (errData.errors ? JSON.stringify(errData.errors) : JSON.stringify(errData));
    throw new Error(`${context} failed: ${msg}`);
  }
  throw error;
};

export const evaluationClient = {
  async register() {
    try {
      const url = `${getBaseUrl()}/register`;
      const payload = {
        email: config.email,
        name: config.name,
        mobileNo: config.mobile,
        githubUsername: config.githubUsername,
        rollNo: config.rollNo,
        accessCode: config.accessCode
      };

      const response = await axios.post(url, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'register');
    }
  },

  async auth(clientId: string, clientSecret: string) {
    try {
      const url = `${getBaseUrl()}/auth`;
      const payload = {
        clientId,
        clientSecret,
        email: config.email,
        name: config.name,
        rollNo: config.rollNo,
        accessCode: config.accessCode
      };

      const response = await axios.post(url, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'auth');
    }
  },

  async getDepots() {
    try {
      await ensureAuth();
      const url = `${getBaseUrl()}/depots`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${config.bearerToken}`
        }
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'getDepots');
    }
  },

  async getVehicles() {
    try {
      await ensureAuth();
      const url = `${getBaseUrl()}/vehicles`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${config.bearerToken}`
        }
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'getVehicles');
    }
  },

  async getNotifications() {
    try {
      await ensureAuth();
      const url = `${getBaseUrl()}/notifications`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${config.bearerToken}`
        }
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'getNotifications');
    }
  }
};
