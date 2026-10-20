import { SlashCommandBuilder } from 'discord.js';
import { buildDesignerAppModal } from '../../modals/applicationModals.js';

export const data = new SlashCommandBuilder()
  .setName('apply-designer')
  .setDescription('Open the Silence Designs Designer Application form');

export async function execute(interaction) {
  const modal = buildDesignerAppModal();
  await interaction.showModal(modal);
}

export default { data, execute };
