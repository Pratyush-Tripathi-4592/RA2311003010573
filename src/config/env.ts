import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  .env file not found. Using defaults.');
}

dotenv.config({ path: envPath });

export const config = {
  port: process.env.PORT || 3000,
  email: process.env.EMAIL || '',
  name: process.env.NAME || '',
  mobile: process.env.MOBILE || '',
  rollNo: process.env.ROLL_NO || '',
  accessCode: process.env.ACCESS_CODE || '',
  githubUsername: process.env.GITHUB_USERNAME || '',
  baseUrl: process.env.BASE_URL || 'http://localhost:8000',
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  bearerToken: process.env.BEARER_TOKEN || '',
};

if (!config.baseUrl || config.baseUrl === 'http://localhost:8000') {
  console.warn('⚠️  BASE_URL not configured. Using default placeholder.');
}

export function updateConfig(newConfig: Partial<typeof config>) {
  Object.assign(config, newConfig);
  
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    if (newConfig.clientId) {
      envContent = updateEnvString(envContent, 'CLIENT_ID', newConfig.clientId);
    }
    if (newConfig.clientSecret) {
      envContent = updateEnvString(envContent, 'CLIENT_SECRET', newConfig.clientSecret);
    }
    if (newConfig.bearerToken) {
      envContent = updateEnvString(envContent, 'BEARER_TOKEN', newConfig.bearerToken);
    }
    
    fs.writeFileSync(envPath, envContent);
  } catch (error) {
    // Silently ignore write errors
  }
}

function updateEnvString(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  }
  return content + (content.endsWith('\\n') || content === '' ? '' : '\\n') + `${key}=${value}\\n`;
}
