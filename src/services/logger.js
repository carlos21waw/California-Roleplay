import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'bot.log');

function maskSecrets(text) {
  if (typeof text !== 'string') text = String(text);
  return text
    .replace(/[a-zA-Z0-9_\-]{24}\.[a-zA-Z0-9_\-]{6}\.[a-zA-Z0-9_\-]{27}/g, '[REDACTED_DISCORD_TOKEN]')
    .replace(/AIzaSy[a-zA-Z0-9_\-]{33}/g, '[REDACTED_API_KEY]');
}

export function log(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const formattedArgs = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
  const rawLine = `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedArgs}`;
  const cleanLine = maskSecrets(rawLine);

  console.log(cleanLine);
  try {
    fs.appendFileSync(logFilePath, cleanLine + '\n', 'utf8');
  } catch {
    // Fail silently on log write
  }
}

export const logger = {
  info: (msg, ...args) => log('info', msg, ...args),
  warn: (msg, ...args) => log('warn', msg, ...args),
  error: (msg, ...args) => log('error', msg, ...args),
  debug: (msg, ...args) => log('debug', msg, ...args)
};

export default logger;
