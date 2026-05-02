import axios from 'axios';
import { config } from '../config/env';

const getBaseUrl = () => config.affordBaseUrl;

export const evaluationClient = {
  async register() {
    const url = `${getBaseUrl()}/evaluation-service/register`;
    const payload = {
      email: config.affordEmail,
      name: config.affordName,
      mobileNo: config.affordMobile,
      githubUsername: config.githubUsername,
      rollNo: config.affordRollNo,
      accessCode: config.affordAccessCode
    };

    const response = await axios.post(url, payload);
    return response.data;
  },

  async auth(clientId: string, clientSecret: string) {
    const url = `${getBaseUrl()}/evaluation-service/auth`;
    const payload = {
      clientId,
      clientSecret
    };

    const response = await axios.post(url, payload);
    return response.data;
  },

  async getDepots() {
    const url = `${getBaseUrl()}/evaluation-service/depots`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${config.bearerToken}`
      }
    });
    return response.data;
  },

  async getVehicles() {
    const url = `${getBaseUrl()}/evaluation-service/vehicles`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${config.bearerToken}`
      }
    });
    return response.data;
  },

  async getNotifications() {
    const url = `${getBaseUrl()}/evaluation-service/notifications`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${config.bearerToken}`
      }
    });
    return response.data;
  }
};
