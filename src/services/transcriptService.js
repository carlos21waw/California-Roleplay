import { AttachmentBuilder } from 'discord.js';
import { getTicketMessages, getTicketByRef } from '../database/db.js';

/**
 * Compiles stored ticket messages into a formatted text transcript
 */
export async function generateTicketTranscript(refId) {
  const ticket = await getTicketByRef(refId);
  const messages = await getTicketMessages(refId);

  const header = [
    '====================================================================',
    '                   SILENCE DESIGNS — TICKET TRANSCRIPT              ',
    '====================================================================',
    `Reference ID   : ${ticket ? ticket.ref_id : refId}`,
    `Customer       : ${ticket ? ticket.user_tag : 'Unknown'} (${ticket ? ticket.user_id : 'N/A'})`,
    `Roblox User    : ${ticket ? ticket.roblox_username : 'N/A'}`,
    `Category       : ${ticket ? ticket.category : 'General'}`,
    `Inquiry        : ${ticket ? ticket.inquiry : 'N/A'}`,
    `Handler        : ${ticket && ticket.claimed_by ? ticket.claimed_by : 'Unclaimed'}`,
    `Created At     : ${ticket ? new Date(ticket.created_at).toUTCString() : 'N/A'}`,
    `Closed At      : ${new Date().toUTCString()}`,
    '====================================================================\n'
  ].join('\n');

  let body = '';
  if (!messages || messages.length === 0) {
    body = 'No messages were recorded in this ticket session.\n';
  } else {
    body = messages.map(m => {
      const time = new Date(m.created_at).toISOString();
      const attachInfo = m.attachments ? ` [Attachment: ${m.attachments}]` : '';
      return `[${time}] ${m.author_tag} (${m.author_id}):\n${m.content}${attachInfo}\n`;
    }).join('\n');
  }

  const footer = '\n======================= END OF TRANSCRIPT =======================';
  const fullText = header + body + footer;

  const buffer = Buffer.from(fullText, 'utf-8');
  const filename = `transcript-${refId.toLowerCase()}.txt`;

  return {
    rawText: fullText,
    filename,
    attachment: new AttachmentBuilder(buffer, { name: filename })
  };
}

export default {
  generateTicketTranscript
};
