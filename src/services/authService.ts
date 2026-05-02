import { evaluationClient } from '../clients/evaluationClient';
import { updateConfig, config } from '../config/env';
import { Log } from '../../logging_middleware';

export class AuthService {
  private tokenExpiry: number | null = null;
  private readonly TOKEN_LIFETIME_MS = 55 * 60 * 1000; // 55 mins caching
  private authPromise: Promise<string> | null = null;

  async getAuthToken(): Promise<string> {
    // If an auth process is already running, wait for it
    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = this._getAuthTokenInternal().finally(() => {
      this.authPromise = null;
    });

    return this.authPromise;
  }

  private async _getAuthTokenInternal(): Promise<string> {
    // 1. If valid token exists in memory, return it
    if (config.bearerToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return config.bearerToken;
    }

    try {
      // 2. If no token but we have clientId & secret, just Auth
      if (config.clientId && config.clientSecret) {
        await Log('backend', 'info', 'service', 'Authenticating with existing credentials');
        return await this.performAuth(config.clientId, config.clientSecret);
      }

      // 3. Otherwise, we must Register first, then Auth
      await Log('backend', 'info', 'service', 'No credentials found, starting registration');
      const regResponse = await evaluationClient.register();
      const clientId = regResponse.clientId || regResponse.clientID;
      const clientSecret = regResponse.clientSecret;

      if (!clientId || !clientSecret) {
        throw new Error('Missing credentials in registration response');
      }

      updateConfig({ clientId, clientSecret });
      console.log('✅ Registration successful. Please add these to your .env:');
      console.log(`AFFORD_CLIENT_ID=${clientId}`);
      console.log(`AFFORD_CLIENT_SECRET=${clientSecret}`);

      await Log('backend', 'success', 'service', 'Registration successful');
      return await this.performAuth(clientId, clientSecret);

    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      await Log('backend', 'error', 'service', `Auth flow failed: ${errorMsg}`);
      throw error;
    }
  }

  private async performAuth(clientId: string, clientSecret: string): Promise<string> {
    const authResponse = await evaluationClient.auth(clientId, clientSecret);
    const bearerToken = authResponse.token || authResponse.bearerToken || authResponse.access_token;
    
    if (!bearerToken) {
      throw new Error('Missing token in auth response');
    }

    this.tokenExpiry = Date.now() + this.TOKEN_LIFETIME_MS;
    updateConfig({ bearerToken });
    
    await Log('backend', 'success', 'service', 'Authentication successful');
    return bearerToken;
  }

  async registerAndAuth() {
    // Manual trigger for /auth/register route
    const token = await this.getAuthToken();
    return {
      success: true,
      message: 'Successfully verified authentication',
      tokenSet: !!token
    };
  }

  async testAuth() {
    try {
      await evaluationClient.getDepots();
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
