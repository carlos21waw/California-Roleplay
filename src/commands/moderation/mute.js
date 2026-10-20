import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isStaff, canModerate } from '../../permissions/checkPermissions.js';
import { logModeration } from '../../database/db.js';
import { createModerationEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Timeout/mute a member for a specified duration')
  .addUserOption(option => option.setName('user').setDescription('The member to mute').setRequired(true))
  .addIntegerOption(option =>
    option
      .setName('minutes')
      .setDescription('Duration in minutes')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(40320) // max 28 days
  )
  .addStringOption(option => option.setName('reason').setDescription('Reason for mute').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  if (!isStaff(interaction.member) || !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You do not have permission to mute members.')],
      ephemeral: true
    });
  }

  const targetUser = interaction.options.getUser('user');
  const minutes = interaction.options.getInteger('minutes');
  const reason = interaction.options.getString('reason') || 'Violation of community rules.';

  const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
  if (!targetMember) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', 'Member is not in the server.')],
      ephemeral: true
    });
  }

  if (!canModerate(interaction.member, targetMember)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Hierarchy Error', 'You cannot mute a member with equal or higher role hierarchy.')],
      ephemeral: true
    });
  }

  const ms = minutes * 60 * 1000;

  try {
    await targetMember.timeout(ms, `${interaction.user.tag}: ${reason}`);
    await logModeration(targetUser.id, interaction.guildId, 'MUTE', interaction.user.id, reason, `${minutes}m`);

    const embed = createModerationEmbed('Muted (Timeout)', targetUser, interaction.user, reason, [
      { name: 'Duration', value: `${minutes} minute(s)`, inline: true }
    ]);
    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Mute Failed', err.message)],
      ephemeral: true
    });
  }
}

export default { data, execute };
