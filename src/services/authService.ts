import { evaluationClient } from '../clients/evaluationClient';
import { updateConfig, config } from '../config/env';
import { Log } from '../../logging_middleware';

export class AuthService {
  async registerAndAuth() {
    await Log('backend', 'info', 'service', 'Starting registration process');
    
    try {
      // 1. Register
      const regResponse = await evaluationClient.register();
      const clientId = regResponse.clientId || regResponse.clientID;
      const clientSecret = regResponse.clientSecret;

      if (!clientId || !clientSecret) {
        throw new Error('Missing credentials in registration response');
      }

      await Log('backend', 'success', 'service', 'Registration successful');
      
      updateConfig({ clientId, clientSecret });

      // 2. Auth
      await Log('backend', 'info', 'service', 'Starting auth process');
      const authResponse = await evaluationClient.auth(clientId, clientSecret);
      
      const bearerToken = authResponse.token || authResponse.bearerToken || authResponse.access_token;
      if (!bearerToken) {
        throw new Error('Missing token in auth response');
      }

      updateConfig({ bearerToken });
      
      await Log('backend', 'success', 'service', 'Authentication successful');

      return {
        success: true,
        message: 'Successfully registered and authenticated',
        clientId: config.clientId,
        tokenSet: true
      };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
      await Log('backend', 'error', 'service', `Auth flow failed: ${errorMsg}`);
      throw error;
    }
  }

  async testAuth() {
    try {
      // Just try to fetch depots to see if token is valid
      await evaluationClient.getDepots();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
