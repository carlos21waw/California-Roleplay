import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isStaff, canModerate } from '../../permissions/checkPermissions.js';
import { logModeration } from '../../database/db.js';
import { createModerationEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a member from the server for rule violations')
  .addUserOption(option => option.setName('user').setDescription('The member to ban').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for the ban').setRequired(false))
  .addIntegerOption(option =>
    option
      .setName('delete_days')
      .setDescription('Number of days of message history to delete (0-7)')
      .setMinValue(0)
      .setMaxValue(7)
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction) {
  if (!isStaff(interaction.member) || !interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You do not have permission to ban members.')],
      ephemeral: true
    });
  }

  const targetUser = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided.';
  const deleteDays = interaction.options.getInteger('delete_days') || 0;

  const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

  if (targetMember && !canModerate(interaction.member, targetMember)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Hierarchy Error', 'You cannot ban a user with equal or higher role hierarchy.')],
      ephemeral: true
    });
  }

  // Attempt to DM user first
  try {
    await targetUser.send({
      embeds: [
        createModerationEmbed('Banned', targetUser, interaction.user, reason, [
          { name: 'Server', value: interaction.guild.name, inline: true }
        ])
      ]
    }).catch(() => null);
  } catch {
    // Ignore DM error
  }

  try {
    await interaction.guild.members.ban(targetUser.id, {
      deleteMessageSeconds: deleteDays * 86400,
      reason: `${interaction.user.tag}: ${reason}`
    });

    await logModeration(targetUser.id, interaction.guildId, 'BAN', interaction.user.id, reason);

    const embed = createModerationEmbed('Banned', targetUser, interaction.user, reason);
    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Ban Failed', `Could not complete ban: ${err.message}`)],
      ephemeral: true
    });
  }
}

export default { data, execute };
