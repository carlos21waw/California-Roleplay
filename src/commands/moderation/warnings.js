import { SlashCommandBuilder } from 'discord.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { getWarnings } from '../../database/db.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('View the moderation warning history for a user')
  .addUserOption(option => option.setName('user').setDescription('The user to lookup').setRequired(false));

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;

  // Non-staff can only see their own warnings
  if (targetUser.id !== interaction.user.id && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You may only view your own warnings.')],
      ephemeral: true
    });
  }

  const list = await getWarnings(targetUser.id, interaction.guildId);

  if (!list || list.length === 0) {
    return interaction.reply({
      content: `✅ <@${targetUser.id}> has a clean record with **0** warnings.`,
      ephemeral: true
    });
  }

  const items = list.map((w, idx) =>
    `**#${idx + 1}** — By <@${w.moderator_id}> on <t:${Math.floor(w.created_at / 1000)}:d>\n> Reason: ${w.reason}`
  );

  const embed = createBaseEmbed({
    title: `⚠️ Warnings for @${targetUser.username} (${list.length})`,
    description: items.join('\n\n'),
    color: 0xF59E0B
  });

  await interaction.reply({ embeds: [embed], ephemeral: targetUser.id === interaction.user.id });
}

export default { data, execute };
