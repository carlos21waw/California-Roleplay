import { SlashCommandBuilder } from 'discord.js';
import { buildGeneralSupportModal } from '../../modals/generalSupportModal.js';
import { buildDesignOrderModal } from '../../modals/designOrderModal.js';
import { buildReportMemberModal } from '../../modals/reportMemberModal.js';

export const data = new SlashCommandBuilder()
  .setName('ticket-open')
  .setDescription('Open a private support or order ticket with Silence Designs')
  .addStringOption(option =>
    option
      .setName('category')
      .setDescription('Ticket category')
      .setRequired(false)
      .addChoices(
        { name: 'General Support', value: 'support' },
        { name: 'Design Order', value: 'order' },
        { name: 'Report a Member', value: 'report' }
      )
  );

export async function execute(interaction) {
  const category = interaction.options.getString('category') || 'support';

  if (category === 'order') {
    return interaction.showModal(buildDesignOrderModal());
  }

  if (category === 'report') {
    return interaction.showModal(buildReportMemberModal());
  }

  return interaction.showModal(buildGeneralSupportModal());
}

export default { data, execute };
