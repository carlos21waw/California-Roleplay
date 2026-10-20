import { isStaff, isDesigner } from '../permissions/checkPermissions.js';
import { getTicketByRef, updateTicket } from '../database/db.js';
import { createTicketReceiptEmbed, createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../embeds/embedBuilder.js';
import { generateTicketTranscript } from '../services/transcriptService.js';
import { formatDiscordTimestamp } from '../utils/formatters.js';
import config from '../config/config.js';
import logger from '../services/logger.js';

export async function handleTicketButtons(interaction) {
  const customId = interaction.customId;

  // 1. Handle Claim
  if (customId.startsWith('ticket_claim_')) {
    const member = interaction.member;
    if (!isStaff(member) && !isDesigner(member)) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            'Authorization Required',
            'Only authorized Support, Administration, or Management team members may claim tickets.',
            'ERR_STAFF_ONLY'
          )
        ],
        ephemeral: true
      });
    }

    const refId = customId.replace('ticket_claim_', '');
    const ticket = await getTicketByRef(refId);

    if (!ticket) {
      return interaction.reply({
        embeds: [
          createErrorEmbed('Ticket Record Missing', 'This ticket reference does not exist in the database.', 'ERR_NOT_FOUND')
        ],
        ephemeral: true
      });
    }

    if (ticket.claimed_by) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            'Ticket Already Claimed',
            `This inquiry is currently assigned to <@${ticket.claimed_by}>. Use \`/ticket-transfer\` to reassign.`,
            'ERR_ALREADY_CLAIMED'
          )
        ],
        ephemeral: true
      });
    }

    await updateTicket(refId, { claimed_by: interaction.user.id });

    const claimEmbed = createSuccessEmbed(
      `Inquiry Claimed — ${refId}`,
      `This channel has officially been claimed by <@${interaction.user.id}>.`,
      [
        { name: 'Representative', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Customer Account', value: `<@${ticket.user_id}>`, inline: true },
        { name: 'Claimed Timestamp', value: formatDiscordTimestamp(Date.now(), 't'), inline: true }
      ],
      'Our team member will review your specifications and reply directly in this channel.'
    );

    await interaction.reply({ embeds: [claimEmbed] });

    try {
      await interaction.channel.setName(`claimed-${refId.toLowerCase()}`).catch(() => null);
    } catch {
      // Ignore channel rename rate limits
    }
    return;
  }

  // 2. Handle Close
  if (customId.startsWith('ticket_close_')) {
    const refId = customId.replace('ticket_close_', '');
    const ticket = await getTicketByRef(refId);

    const loadingEmbed = createLoadingEmbed('Compiling conversation history, generating receipt, and archiving channel...');
    await interaction.reply({ embeds: [loadingEmbed] });

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
          content: `📁 **Ticket Closed:** \`${refId}\` | Customer: <@${ticket?.user_id}> | Handler: <@${handler.id}> | DM Delivery: ${dmDelivered ? '✅ Delivered' : '⚠️ Failed / Blocked'}`,
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

  // 3. Handle Red Report button inside ticket
  if (customId.startsWith('ticket_report_')) {
    const refId = customId.replace('ticket_report_', '');
    const reportNotice = createErrorEmbed(
      'Staff Misconduct Escalation Protocol',
      'If you are experiencing unprofessional behavior, prolonged inactivity (over 48h), or severe disrespect from an assigned staff member, please take the following steps:',
      'ESCALATE_REPORT',
      '1. Note your Reference ID: `' + refId + '`\n2. Mention the `@Executive Team` role or submit a confidential report with `/ticket-open category:Report a Member`.'
    );
    return interaction.reply({
      embeds: [reportNotice],
      ephemeral: true
    });
  }
}

export default {
  handleTicketButtons
};
