import axios from 'axios';
import { config } from '../config/env';

export type LogLevel = 'success' | 'warn' | 'error' | 'fatal' | 'info';
export type StackType = 'backend' | 'frontend';
export type AllowedPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';

export async function Log(
  stack: StackType,
  level: LogLevel,
  pkg: AllowedPackage,
  message: string
): Promise<void> {
  const payload = {
    stack: stack.toLowerCase(),
    level: level.toLowerCase(),
    package: pkg.toLowerCase(),
    message
  };
  try {
    const url = `${config.affordBaseUrl}/log`;
    // We use fire and forget to never block the app
    axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${config.bearerToken || ''}`
      },
      timeout: 3000
    }).catch(error => {
      // Fallback to console for debugging if network call fails
    });
  } catch (err) {
    // Synchronous errors handled here
    console.error('[Logger Sync Error]:', err);
  }
}
