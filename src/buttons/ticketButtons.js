import { isStaff, isDesigner } from '../permissions/checkPermissions.js';
import { getTicketByRef, updateTicket, getTicketByChannel } from '../database/db.js';
import { createTicketReceiptEmbed, createSuccessEmbed, createErrorEmbed } from '../embeds/embedBuilder.js';
import { generateTicketTranscript } from '../services/transcriptService.js';
import config from '../config/config.js';
import logger from '../services/logger.js';

export async function handleTicketButtons(interaction) {
  const customId = interaction.customId;

  // Handle Claim
  if (customId.startsWith('ticket_claim_')) {
    const member = interaction.member;
    if (!isStaff(member) && !isDesigner(member)) {
      return interaction.reply({
        embeds: [createErrorEmbed('Permission Denied', 'Only authorized Support, Administration, or Management team members may claim tickets.')],
        ephemeral: true
      });
    }

    const refId = customId.replace('ticket_claim_', '');
    const ticket = await getTicketByRef(refId);

    if (!ticket) {
      return interaction.reply({
        embeds: [createErrorEmbed('Not Found', 'Ticket record was not found.')],
        ephemeral: true
      });
    }

    if (ticket.claimed_by) {
      return interaction.reply({
        content: `⚠️ This ticket is already claimed by <@${ticket.claimed_by}>.`,
        ephemeral: true
      });
    }

    await updateTicket(refId, { claimed_by: interaction.user.id });

    // Update message or send announcement
    await interaction.reply({
      embeds: [createSuccessEmbed('Ticket Claimed', `This ticket has been claimed by <@${interaction.user.id}>. They will handle your inquiry.`)]
    });

    try {
      await interaction.channel.setName(`claimed-${refId.toLowerCase()}`).catch(() => null);
    } catch {
      // Ignore channel rename rate limits
    }
    return;
  }

  // Handle Close
  if (customId.startsWith('ticket_close_')) {
    const refId = customId.replace('ticket_close_', '');
    const ticket = await getTicketByRef(refId);

    await interaction.reply({
      content: '🔒 Closing ticket, compiling transcript, and generating receipt...'
    });

    const handler = ticket && ticket.claimed_by
      ? await interaction.client.users.fetch(ticket.claimed_by).catch(() => interaction.user)
      : interaction.user;

    const receiptEmbed = createTicketReceiptEmbed(handler, refId, 'Has been resolved.');
    const transcript = await generateTicketTranscript(refId);

    // Update DB
    await updateTicket(refId, {
      status: 'Closed',
      closed_at: Date.now(),
      closure_reason: 'Has been resolved.'
    });

    // Attempt to DM creator
    let dmDelivered = false;
    if (ticket && ticket.user_id) {
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
        logger.warn(`[TicketButtons] Could not DM ticket creator ${ticket.user_id}:`, err.message);
      }
    }

    // Send to staff transcript log channel
    if (config.channels.transcripts) {
      const logChan = await interaction.client.channels.fetch(config.channels.transcripts).catch(() => null);
      if (logChan) {
        await logChan.send({
          content: `📁 **Ticket Closed:** \`${refId}\` | Customer: <@${ticket?.user_id}> | Handler: <@${handler.id}> | DM Delivery: ${dmDelivered ? 'Delivered' : 'Failed/Blocked'}`,
          embeds: [receiptEmbed],
          files: [transcript.attachment]
        }).catch(() => null);
      }
    }

    // Delete ticket channel after 5-second notice
    setTimeout(async () => {
      try {
        await interaction.channel.delete(`Ticket ${refId} closed by ${interaction.user.tag}`);
      } catch (err) {
        logger.error(`[TicketButtons] Error deleting ticket channel:`, err.message);
      }
    }, 5000);
    return;
  }

  // Handle Red Report button inside ticket
  if (customId.startsWith('ticket_report_')) {
    return interaction.reply({
      content: '🚨 **Notice to Customer:** If you are experiencing misconduct, harassment, or severe delays from any staff member, please save your ticket reference and ping an Executive or submit a formal report.',
      ephemeral: true
    });
  }
}

export default {
  handleTicketButtons
};
