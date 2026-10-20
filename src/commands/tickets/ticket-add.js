import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getTicketByChannel } from '../../database/db.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-add')
  .setDescription('Add a user or designer to the current ticket channel')
  .addUserOption(option =>
    option.setName('user').setDescription('The user to grant access').setRequired(true)
  );

export async function execute(interaction) {
  const ticket = await getTicketByChannel(interaction.channelId);
  if (!ticket) {
    return interaction.reply({
      embeds: [createErrorEmbed('Invalid Channel', 'This command can only be used inside a ticket channel.')],
      ephemeral: true
    });
  }

  if (ticket.user_id !== interaction.user.id && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only ticket participants or staff can add users.')],
      ephemeral: true
    });
  }

  const target = interaction.options.getUser('user');

  try {
    await interaction.channel.permissionOverwrites.edit(target.id, {
      [PermissionFlagsBits.ViewChannel]: true,
      [PermissionFlagsBits.SendMessages]: true,
      [PermissionFlagsBits.AttachFiles]: true,
      [PermissionFlagsBits.ReadMessageHistory]: true
    });

    await interaction.reply({
      embeds: [createSuccessEmbed('User Added', `<@${target.id}> has been granted access to this ticket.`)]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Error', `Could not update channel permissions: ${err.message}`)],
      ephemeral: true
    });
  }
}

export default { data, execute };
