import { SlashCommandBuilder } from 'discord.js';
import { buildStaffAppModal } from '../../modals/applicationModals.js';

export const data = new SlashCommandBuilder()
  .setName('apply-staff')
  .setDescription('Open the Silence Designs Community Staff Application form');

export async function execute(interaction) {
  const modal = buildStaffAppModal();
  await interaction.showModal(modal);
}

export default { data, execute };
