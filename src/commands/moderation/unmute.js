import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { logModeration } from '../../database/db.js';
import { createModerationEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Remove timeout/mute from a member')
  .addUserOption(option => option.setName('user').setDescription('The member to unmute').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for unmuting').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  if (!isStaff(interaction.member) || !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You do not have permission to unmute members.')],
      ephemeral: true
    });
  }

  const targetUser = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'Timeout removed by staff.';
  const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

  if (!targetMember) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', 'Member is not in the server.')],
      ephemeral: true
    });
  }

  try {
    await targetMember.timeout(null, `${interaction.user.tag}: ${reason}`);
    await logModeration(targetUser.id, interaction.guildId, 'UNMUTE', interaction.user.id, reason);

    const embed = createModerationEmbed('Unmuted', targetUser, interaction.user, reason);
    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Unmute Failed', err.message)],
      ephemeral: true
    });
  }
}

export default { data, execute };
