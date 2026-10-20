import { addGiveawayEntry, getGiveawayByMessage, getGiveawayEntryCount, getGiveawayEntries } from '../database/db.js';
import { createBaseEmbed } from '../embeds/embedBuilder.js';
import logger from '../services/logger.js';

export async function handleGiveawayButtons(interaction) {
  const customId = interaction.customId;

  if (customId === 'gw_join_btn') {
    const gw = await getGiveawayByMessage(interaction.message.id);
    if (!gw) {
      return interaction.reply({ content: '❌ Giveaway record not found or already archived.', ephemeral: true });
    }

    if (gw.status !== 'Active' || Date.now() >= gw.end_time) {
      return interaction.reply({ content: '⚠️ This giveaway has already concluded.', ephemeral: true });
    }

    const result = await addGiveawayEntry(gw.id, interaction.user.id);
    if (!result.success && result.duplicate) {
      return interaction.reply({ content: '⚠️ You are already entered into this giveaway! Good luck!', ephemeral: true });
    }

    // Fetch updated count
    const count = await getGiveawayEntryCount(gw.id);

    // Update message embed with participant count if possible
    try {
      const oldEmbed = interaction.message.embeds[0];
      if (oldEmbed) {
        const updatedEmbed = createBaseEmbed({
          title: oldEmbed.title,
          description: oldEmbed.description.replace(/• \*\*Entries:\*\* \d+/, `• **Entries:** ${count}`),
          color: oldEmbed.color,
          thumbnail: oldEmbed.thumbnail?.url,
          footerText: oldEmbed.footer?.text
        });
        await interaction.message.edit({ embeds: [updatedEmbed] }).catch(() => null);
      }
    } catch (err) {
      logger.warn('[GiveawayButtons] Could not update live entry count:', err.message);
    }

    return interaction.reply({
      content: '🎉 **You are entered. Good luck!**',
      ephemeral: true
    });
  }

  if (customId === 'gw_participants_btn') {
    const gw = await getGiveawayByMessage(interaction.message.id);
    if (!gw) {
      return interaction.reply({ content: '❌ Giveaway record not found.', ephemeral: true });
    }

    const count = await getGiveawayEntryCount(gw.id);
    return interaction.reply({
      content: `👥 There are currently **${count}** verified participant(s) entered into this giveaway for **${gw.prize}**.`,
      ephemeral: true
    });
  }
}

export default {
  handleGiveawayButtons
};
