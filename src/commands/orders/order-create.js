import { SlashCommandBuilder } from 'discord.js';
import { buildDesignOrderModal } from '../../modals/designOrderModal.js';
import { getServiceStatus } from '../../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('order-create')
  .setDescription('Open the Silence Designs order creation form')
  .addStringOption(option =>
    option
      .setName('service')
      .setDescription('Select the service category')
      .setRequired(false)
      .addChoices(
        { name: 'ER:LC Vehicle Livery', value: 'Livery' },
        { name: 'Roblox Clothing / Uniform', value: 'Clothing' },
        { name: 'Discord Embeds', value: 'Embeds' },
        { name: 'Community Stickers', value: 'Stickers' },
        { name: 'Group / Department Logo', value: 'Logos' },
        { name: 'Graphics / PFP / Banners', value: 'Graphics' },
        { name: 'Custom Discord Bot Development', value: 'Bot Development' },
        { name: 'Discord Server Setup', value: 'Server Setup' }
      )
  );

export async function execute(interaction) {
  const chosenService = interaction.options.getString('service');

  if (chosenService) {
    const statusRecord = await getServiceStatus(chosenService);
    if (statusRecord && !statusRecord.is_open) {
      return interaction.reply({
        content: `❌ **${chosenService}** orders are temporarily closed due to capacity. Please check back soon or run \`/service-status\`.`,
        ephemeral: true
      });
    }
  }

  // Show guided design order modal
  const modal = buildDesignOrderModal();
  await interaction.showModal(modal);
}

export default { data, execute };
