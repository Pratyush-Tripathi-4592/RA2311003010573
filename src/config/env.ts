import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Check if .env exists, if not warn
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  .env file not found. Variables might not be loaded correctly.');
}

dotenv.config({ path: envPath });

export const config = {
  port: process.env.PORT || 3000,
  affordEmail: process.env.AFFORD_EMAIL || '',
  affordName: process.env.AFFORD_NAME || '',
  affordMobile: process.env.AFFORD_MOBILE || '',
  affordRollNo: process.env.AFFORD_ROLL_NO || '',
  affordAccessCode: process.env.AFFORD_ACCESS_CODE || '',
  githubUsername: process.env.GITHUB_USERNAME || '',
  affordBaseUrl: process.env.AFFORD_BASE_URL || 'http://localhost:8000',
  clientId: process.env.AFFORD_CLIENT_ID || '',
  clientSecret: process.env.AFFORD_CLIENT_SECRET || '',
  bearerToken: process.env.AFFORD_BEARER_TOKEN || '',
};

// Validate required env vars at startup
if (!config.affordBaseUrl || config.affordBaseUrl === 'http://localhost:8000') {
  console.warn('⚠️  AFFORD_BASE_URL might be incorrect or using default placeholder.');
}

export function updateConfig(newConfig: Partial<typeof config>) {
  Object.assign(config, newConfig);
  
  // Optionally persist to .env file
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    if (newConfig.clientId) {
      envContent = updateEnvString(envContent, 'AFFORD_CLIENT_ID', newConfig.clientId);
    }
    if (newConfig.clientSecret) {
      envContent = updateEnvString(envContent, 'AFFORD_CLIENT_SECRET', newConfig.clientSecret);
    }
    if (newConfig.bearerToken) {
      envContent = updateEnvString(envContent, 'AFFORD_BEARER_TOKEN', newConfig.bearerToken);
    }
    
    fs.writeFileSync(envPath, envContent);
  } catch (error) {
    // Ignore write errors
  }
}

function updateEnvString(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  }
  return content + (content.endsWith('\\n') || content === '' ? '' : '\\n') + `${key}=${value}\\n`;
}
