import { EmbedBuilder } from 'discord.js';
import { getActiveGiveaways, getGiveawayEntries, completeGiveaway, getGiveaway } from '../database/db.js';
import { createBaseEmbed } from '../embeds/embedBuilder.js';
import config from '../config/config.js';
import logger from '../services/logger.js';

let interval = null;

export async function processDueGiveaways(client) {
  try {
    const active = await getActiveGiveaways();
    const now = Date.now();

    for (const gw of active) {
      if (now >= gw.end_time) {
        await finishGiveaway(client, gw);
      }
    }
  } catch (err) {
    logger.error('[GiveawayScheduler] Error processing due giveaways:', err.message);
  }
}

export async function finishGiveaway(client, gw) {
  try {
    const entries = await getGiveawayEntries(gw.id);
    const participantIds = entries.map(e => e.user_id);
    const winners = [];

    if (participantIds.length > 0) {
      const count = Math.min(gw.winner_count, participantIds.length);
      const shuffled = [...participantIds].sort(() => 0.5 - Math.random());
      winners.push(...shuffled.slice(0, count));
    }

    await completeGiveaway(gw.id, winners);

    // Fetch Discord channel and message to update
    const channel = await client.channels.fetch(gw.channel_id).catch(() => null);
    if (!channel) return winners;

    const message = await channel.messages.fetch(gw.message_id).catch(() => null);

    const winnerText = winners.length > 0
      ? winners.map(w => `<@${w}>`).join(', ')
      : 'No participants entered';

    const endEmbed = createBaseEmbed({
      title: `🎉 GIVEAWAY ENDED — ${gw.prize}`,
      description: `**${gw.title}**\n\n${gw.description || ''}\n\n` +
        `**Winner(s):** ${winnerText}\n` +
        `**Hosted By:** ${gw.sponsor}\n` +
        `**Server:** ${gw.server_name}\n` +
        `**Total Entries:** ${participantIds.length}\n\n` +
        `*Ended <t:${Math.floor(Date.now() / 1000)}:R>*`,
      color: 0x64748B,
      thumbnail: gw.image_url || undefined,
      footerText: 'Silence Designs Giveaways'
    });

    if (message) {
      await message.edit({ embeds: [endEmbed], components: [] }).catch(() => null);
    }

    if (winners.length > 0) {
      await channel.send({
        content: `🎉 Congratulations to ${winnerText} for winning **${gw.prize}**! Contact ${gw.sponsor} to claim.`
      }).catch(() => null);
    }

    logger.info(`[GiveawayScheduler] Giveaway ${gw.id} finished with ${winners.length} winner(s).`);
    return winners;
  } catch (err) {
    logger.error(`[GiveawayScheduler] Failed to finish giveaway ${gw.id}:`, err.message);
    return [];
  }
}

export async function rerollWinners(client, giveawayId) {
  const gw = await getGiveaway(giveawayId);
  if (!gw) throw new Error('Giveaway not found in database.');

  const entries = await getGiveawayEntries(gw.id);
  const participantIds = entries.map(e => e.user_id);
  if (participantIds.length === 0) {
    throw new Error('No entries found for this giveaway to reroll.');
  }

  const count = Math.min(gw.winner_count, participantIds.length);
  const shuffled = [...participantIds].sort(() => 0.5 - Math.random());
  const newWinners = shuffled.slice(0, count);

  await completeGiveaway(gw.id, newWinners);

  const channel = await client.channels.fetch(gw.channel_id).catch(() => null);
  if (channel) {
    const winnerText = newWinners.map(w => `<@${w}>`).join(', ');
    await channel.send({
      content: `🎲 **Giveaway Rerolled!**\nNew Winner(s) for **${gw.prize}**: ${winnerText}!`
    }).catch(() => null);
  }

  return newWinners;
}

export function startGiveawayScheduler(client, intervalMs = 15000) {
  if (interval) clearInterval(interval);
  interval = setInterval(() => processDueGiveaways(client), intervalMs);
}

export function stopGiveawayScheduler() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export default {
  startGiveawayScheduler,
  stopGiveawayScheduler,
  processDueGiveaways,
  finishGiveaway,
  rerollWinners
};
