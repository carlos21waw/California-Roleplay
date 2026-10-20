import { SlashCommandBuilder } from 'discord.js';
import { getTicketByChannel, updateTicket } from '../../database/db.js';
import { isStaff, isDesigner } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-transfer')
  .setDescription('Transfer ticket ownership or assignment to another staff member or designer')
  .addUserOption(option =>
    option.setName('target_staff').setDescription('The staff member receiving the ticket').setRequired(true)
  );

export async function execute(interaction) {
  if (!isStaff(interaction.member) && !isDesigner(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only authorized staff may transfer tickets.')],
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

  const target = interaction.options.getUser('target_staff');
  await updateTicket(ticket.ref_id, { claimed_by: target.id });

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Ticket Transferred',
        `Ticket **${ticket.ref_id}** has been transferred from <@${interaction.user.id}> to <@${target.id}>.`
      )
    ]
  });
}

export default { data, execute };
