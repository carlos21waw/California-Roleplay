import { Events } from 'discord.js';
import logger from '../services/logger.js';
import { startStatusRotation } from '../utils/statusRotation.js';
import { startGiveawayScheduler } from '../jobs/giveawayScheduler.js';
import { startChannelExpiryJob } from '../jobs/channelExpiryJob.js';
import { getDb } from '../database/db.js';
import config from '../config/config.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {
  logger.info(`========================================================`);
  logger.info(`✨ Silence Designs Discord Bot is ONLINE!`);
  logger.info(`Logged in as: ${client.user.tag} (${client.user.id})`);
  logger.info(`Guild count : ${client.guilds.cache.size}`);
  logger.info(`Commands    : ${client.commands ? client.commands.size : 0} loaded`);
  logger.info(`========================================================`);

  // Initialize SQLite database
  try {
    await getDb();
    logger.info('[Database] SQLite connected and tables verified.');
  } catch (err) {
    logger.error('[Database] Failed to connect SQLite database:', err.message);
  }

  // Start background schedulers
  try {
    startStatusRotation(client, 30000);
    logger.info('[StatusRotation] Started rotating 100 Silence Designs activity statuses.');

    startGiveawayScheduler(client, 15000);
    logger.info('[GiveawayScheduler] Background timer active for giveaways.');

    startChannelExpiryJob(client, 60000);
    logger.info('[ChannelExpiryJob] Marketplace channel expiration monitor running.');
  } catch (err) {
    logger.error('[Schedulers] Error starting background jobs:', err.message);
  }
}

export default { name, once, execute };
