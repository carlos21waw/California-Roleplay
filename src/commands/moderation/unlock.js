import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Unlock the current channel and restore chat permissions')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  if (!isStaff(interaction.member) || !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You need `Manage Channels` permission to unlock channels.')],
      ephemeral: true
    });
  }

  try {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
      [PermissionFlagsBits.SendMessages]: null
    });

    await interaction.reply({
      embeds: [
        createSuccessEmbed(
          '🔓 Channel Unlocked',
          `This channel has been unlocked by <@${interaction.user.id}>. Members may resume chatting.`
        )
      ]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Unlock Failed', err.message)],
      ephemeral: true
    });
  }
}

export default { data, execute };
