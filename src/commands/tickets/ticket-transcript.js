import { SlashCommandBuilder } from 'discord.js';
import { getTicketByChannel, getTicketByRef } from '../../database/db.js';
import { generateTicketTranscript } from '../../services/transcriptService.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-transcript')
  .setDescription('Generate and download an official conversation transcript for a ticket')
  .addStringOption(option =>
    option.setName('ref_id').setDescription('Reference ID of the ticket (optional if in ticket channel)').setRequired(false)
  );

export async function execute(interaction) {
  let refId = interaction.options.getString('ref_id');

  if (!refId) {
    const currentTicket = await getTicketByChannel(interaction.channelId);
    if (currentTicket) {
      refId = currentTicket.ref_id;
    }
  }

  if (!refId) {
    return interaction.reply({
      embeds: [createErrorEmbed('Missing Parameter', 'Please provide a `ref_id` or run this command within a ticket channel.')],
      ephemeral: true
    });
  }

  refId = refId.toUpperCase();
  const ticket = await getTicketByRef(refId);
  if (!ticket) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `No ticket found with Reference ID \`${refId}\`.`)],
      ephemeral: true
    });
  }

  // Authorization check
  if (ticket.user_id !== interaction.user.id && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You do not have permission to access this ticket transcript.')],
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });
  const transcript = await generateTicketTranscript(refId);

  await interaction.editReply({
    content: `📄 Official Transcript for Ticket **${refId}** (${ticket.category}):`,
    files: [transcript.attachment]
  });
}

export default { data, execute };
