import { SlashCommandBuilder } from 'discord.js';
import { getTicketByChannel, updateTicket } from '../../database/db.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-priority')
  .setDescription('Set the operational priority level for the current ticket')
  .addStringOption(option =>
    option
      .setName('level')
      .setDescription('Priority level')
      .setRequired(true)
      .addChoices(
        { name: 'Low', value: 'Low' },
        { name: 'Normal', value: 'Normal' },
        { name: 'High', value: 'High' },
        { name: 'Urgent', value: 'Urgent' }
      )
  );

export async function execute(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only authorized staff members can adjust ticket priority.')],
      ephemeral: true
    });
  }

  const ticket = await getTicketByChannel(interaction.channelId);
  if (!ticket) {
    return interaction.reply({
      embeds: [createErrorEmbed('Invalid Channel', 'This command can only be used in an active ticket channel.')],
      ephemeral: true
    });
  }

  const level = interaction.options.getString('level');
  await updateTicket(ticket.ref_id, { priority: level });

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Priority Updated',
        `Ticket **${ticket.ref_id}** priority has been set to **${level}** by <@${interaction.user.id}>.`
      )
    ]
  });
}

export default { data, execute };
