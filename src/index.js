import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/config.js';
import { loadCommands } from './commands/index.js';
import logger from './services/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Discord Client with appropriate intents and partials
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

client.commands = new Collection();

async function startBot() {
  logger.info('========================================================');
  logger.info(`Starting ${config.botName} v${config.botVersion}...`);
  logger.info('========================================================');

  // Load all slash commands
  try {
    await loadCommands(client);
  } catch (err) {
    logger.error('Failed to load slash commands:', err);
  }

  // Load all event handlers from src/events
  const eventsPath = path.join(__dirname, 'events');
  if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      try {
        const eventModule = await import(`file://${filePath}`);
        const event = eventModule.default || eventModule;

        if (event && event.name && event.execute) {
          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }
          logger.info(`[Events] Loaded event: ${event.name} (${file})`);
        }
      } catch (err) {
        logger.error(`[Events] Error loading event ${file}:`, err);
      }
    }
  }

  // Check Discord Token
  const token = config.token || process.env.DISCORD_TOKEN;
  if (!token) {
    logger.warn('-----------------------------------------------------------------------------');
    logger.warn('WARNING: DISCORD_TOKEN is not defined in your .env file!');
    logger.warn('Please copy .env.example to .env and insert your bot token:');
    logger.warn('PowerShell: Copy-Item .env.example .env');
    logger.warn('Then set: DISCORD_TOKEN=your_token_here');
    logger.warn('-----------------------------------------------------------------------------');
    return;
  }

  // Log in to Discord Gateway
  try {
    logger.info('Connecting to Discord Gateway...');
    await client.login(token);
  } catch (err) {
    logger.error('CRITICAL: Failed to login to Discord:', err.message);
  }
}

// Graceful process error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('[Process] Uncaught Exception:', err);
});

startBot();

export default client;
