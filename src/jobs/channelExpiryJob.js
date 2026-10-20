import { getDb } from '../database/db.js';
import config from '../config/config.js';
import logger from '../services/logger.js';

let interval = null;

export async function checkChannelExpirations(client) {
  try {
    const db = await getDb();
    const now = Date.now();
    const expired = await db.all(
      'SELECT * FROM marketplace_ads WHERE status = "Active" AND expires_at IS NOT NULL AND expires_at <= ?',
      [now]
    );

    for (const ad of expired) {
      if (ad.channel_id) {
        const channel = await client.channels.fetch(ad.channel_id).catch(() => null);
        if (channel) {
          try {
            await channel.send('⏳ **Marketplace Notice:** This channel rental period of 30 days has expired. Channel will now be closed.');
            await channel.delete('Marketplace 30-day rental expiration').catch((err) => {
              logger.warn(`[ChannelExpiryJob] Could not auto-delete channel ${ad.channel_id}:`, err.message);
            });
          } catch (err) {
            logger.warn(`[ChannelExpiryJob] Error in cleanup for ad ${ad.id}:`, err.message);
          }
        }
      }

      await db.run('UPDATE marketplace_ads SET status = "Expired" WHERE id = ?', [ad.id]);
      logger.info(`[ChannelExpiryJob] Expired marketplace ad ${ad.id} (Channel: ${ad.channel_id})`);
    }
  } catch (err) {
    logger.error('[ChannelExpiryJob] Error checking channel expirations:', err.message);
  }
}

export function startChannelExpiryJob(client, intervalMs = 60000) {
  if (interval) clearInterval(interval);
  interval = setInterval(() => checkChannelExpirations(client), intervalMs);
}

export function stopChannelExpiryJob() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export default {
  startChannelExpiryJob,
  stopChannelExpiryJob,
  checkChannelExpirations
};
