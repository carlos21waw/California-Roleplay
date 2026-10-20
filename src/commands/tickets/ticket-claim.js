import { SlashCommandBuilder } from 'discord.js';
import { getTicketByChannel, updateTicket } from '../../database/db.js';
import { isStaff, isDesigner } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-claim')
  .setDescription('Claim the current ticket as your active inquiry to handle');

export async function execute(interaction) {
  if (!isStaff(interaction.member) && !isDesigner(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only authorized Support, Administration, or Management team members may claim tickets.')],
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

  if (ticket.claimed_by) {
    return interaction.reply({
      embeds: [createErrorEmbed('Already Claimed', `This ticket is already claimed by <@${ticket.claimed_by}>. Use \`/ticket-transfer\` to hand it over.`)],
      ephemeral: true
    });
  }

  await updateTicket(ticket.ref_id, { claimed_by: interaction.user.id });

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Ticket Claimed',
        `<@${interaction.user.id}> has claimed this ticket and will be your primary point of contact.`
      )
    ]
  });

  try {
    await interaction.channel.setName(`claimed-${ticket.ref_id.toLowerCase()}`).catch(() => null);
  } catch {
    // Ignore rename rate limit
  }
}

export default { data, execute };
