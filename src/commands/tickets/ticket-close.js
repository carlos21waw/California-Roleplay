import { SlashCommandBuilder } from 'discord.js';
import { getTicketByChannel, updateTicket } from '../../database/db.js';
import { createTicketReceiptEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { generateTicketTranscript } from '../../services/transcriptService.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import config from '../../config/config.js';
import logger from '../../services/logger.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-close')
  .setDescription('Close the current ticket channel and generate transcript & receipt')
  .addStringOption(option =>
    option.setName('reason').setDescription('Reason for closing the ticket').setRequired(false)
  );

export async function execute(interaction) {
  const ticket = await getTicketByChannel(interaction.channelId);

  if (!ticket) {
    return interaction.reply({
      embeds: [createErrorEmbed('Invalid Channel', 'This command can only be executed inside an active ticket channel.')],
      ephemeral: true
    });
  }

  // Authorization: ticket creator or staff
  const isCreator = ticket.user_id === interaction.user.id;
  if (!isCreator && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only the ticket creator or authorized staff can close this ticket.')],
      ephemeral: true
    });
  }

  const reason = interaction.options.getString('reason') || 'Has been resolved.';
  await interaction.reply({ content: '🔒 Finalizing ticket, generating transcript and closure receipt...' });

  const handler = ticket.claimed_by
    ? await interaction.client.users.fetch(ticket.claimed_by).catch(() => interaction.user)
    : interaction.user;

  const receiptEmbed = createTicketReceiptEmbed(handler, ticket.ref_id, reason);
  const transcript = await generateTicketTranscript(ticket.ref_id);

  // Update DB
  await updateTicket(ticket.ref_id, {
    status: 'Closed',
    closed_at: Date.now(),
    closure_reason: reason
  });

  // Attempt to DM the creator
  let dmDelivered = false;
  try {
    const creator = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
    if (creator) {
      await creator.send({
        embeds: [receiptEmbed],
        files: [transcript.attachment]
      });
      dmDelivered = true;
    }
  } catch (err) {
    logger.warn(`[TicketClose] DM to creator ${ticket.user_id} failed:`, err.message);
  }

  // Staff log
  if (config.channels.transcripts) {
    const logChan = await interaction.client.channels.fetch(config.channels.transcripts).catch(() => null);
    if (logChan) {
      await logChan.send({
        content: `📁 **Ticket Closed:** \`${ticket.ref_id}\` | Customer: <@${ticket.user_id}> | Handler: <@${handler.id}> | DM Status: ${dmDelivered ? '✅ Delivered' : '⚠️ Failed / Blocked'}`,
        embeds: [receiptEmbed],
        files: [transcript.attachment]
      }).catch(() => null);
    }
  }

  setTimeout(async () => {
    try {
      await interaction.channel.delete(`Ticket ${ticket.ref_id} closed`);
    } catch (err) {
      logger.error('[TicketClose] Error deleting channel:', err.message);
    }
  }, 4000);
}

export default { data, execute };
