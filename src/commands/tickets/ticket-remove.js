import { SlashCommandBuilder } from 'discord.js';
import { getTicketByChannel } from '../../database/db.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-remove')
  .setDescription('Remove a user from the current ticket channel')
  .addUserOption(option =>
    option.setName('user').setDescription('The user to remove').setRequired(true)
  );

export async function execute(interaction) {
  const ticket = await getTicketByChannel(interaction.channelId);
  if (!ticket) {
    return interaction.reply({
      embeds: [createErrorEmbed('Invalid Channel', 'This command can only be used inside a ticket channel.')],
      ephemeral: true
    });
  }

  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only authorized staff members can remove users from tickets.')],
      ephemeral: true
    });
  }

  const target = interaction.options.getUser('user');
  if (target.id === ticket.user_id) {
    return interaction.reply({
      embeds: [createErrorEmbed('Cannot Remove Creator', 'You cannot remove the ticket creator from their own ticket.')],
      ephemeral: true
    });
  }

  try {
    await interaction.channel.permissionOverwrites.delete(target.id);
    await interaction.reply({
      embeds: [createSuccessEmbed('User Removed', `<@${target.id}> has been removed from this ticket.`)]
    });
  } catch (err) {
    await interaction.reply({
      embeds: [createErrorEmbed('Error', `Could not update permissions: ${err.message}`)],
      ephemeral: true
    });
  }
}

export default { data, execute };
