import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isStaff, canModerate } from '../../permissions/checkPermissions.js';
import { logModeration } from '../../database/db.js';
import { createModerationEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a member from the server')
  .addUserOption(option => option.setName('user').setDescription('The member to kick').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for kick').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction) {
  if (!isStaff(interaction.member) || !interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You do not have permission to kick members.')],
      ephemeral: true
    });
  }

  const targetUser = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided.';
  const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

  if (!targetMember) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', 'That user is not currently in this server.')],
      ephemeral: true
    });
  }

  if (!canModerate(interaction.member, targetMember)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Hierarchy Error', 'You cannot kick a user with equal or higher role hierarchy.')],
      ephemeral: true
    });
  }

  try {
    await targetUser.send({
      embeds: [createModerationEmbed('Kicked', targetUser, interaction.user, reason)]
    }).catch(() => null);
  } catch {
    // Ignore DM error
  }

  try {
    await targetMember.kick(`${interaction.user.tag}: ${reason}`);
    await logModeration(targetUser.id, interaction.guildId, 'KICK', interaction.user.id, reason);

    const embed = createModerationEmbed('Kicked', targetUser, interaction.user, reason);
    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Kick Failed', err.message)],
      ephemeral: true
    });
  }
}

export default { data, execute };
