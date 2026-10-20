import { Events } from 'discord.js';
import { getTicketByChannel, saveTicketMessage } from '../database/db.js';

export const name = Events.MessageCreate;

export async function execute(message) {
  if (message.author.bot) return;

  // Check if message was sent inside an active ticket channel
  const ticket = await getTicketByChannel(message.channelId).catch(() => null);
  if (ticket) {
    const attachmentUrls = message.attachments.map(a => a.url).join(', ');
    await saveTicketMessage(
      ticket.ref_id,
      message.author.id,
      message.author.tag,
      message.content,
      attachmentUrls
    ).catch(() => null);
  }
}

export default { name, execute };
