import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Lock the current channel to prevent members from sending messages')
  .addStringOption(option => option.setName('reason').setDescription('Reason for lockdown').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  if (!isStaff(interaction.member) || !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You need `Manage Channels` permission to lock channels.')],
      ephemeral: true
    });
  }

  const reason = interaction.options.getString('reason') || 'Channel locked by staff.';

  try {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
      [PermissionFlagsBits.SendMessages]: false
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          '🔒 Channel Locked',
          `This channel has been locked by <@${interaction.user.id}>.\n• **Reason:** ${reason}\n\nMembers cannot send messages until unlocked.`
        )
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Lock Failed', err.message)],
      ephemeral: true
    });
  }
}

export default { data, execute };
