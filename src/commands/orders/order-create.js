import { SlashCommandBuilder } from 'discord.js';
import { buildDesignOrderModal } from '../../modals/designOrderModal.js';
import { getServiceStatus } from '../../database/db.js';
import { createWarningEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('order-create')
  .setDescription('Open the guided Silence Designs commission creation form')
  .addStringOption(option =>
    option
      .setName('service')
      .setDescription('Target design category')
      .setRequired(false)
      .addChoices(
        { name: 'ER:LC Vehicle Livery', value: 'Livery' },
        { name: 'Roblox Clothing / Uniform', value: 'Clothing' },
        { name: 'Discord Embeds Suite', value: 'Embeds' },
        { name: 'Community Stickers', value: 'Stickers' },
        { name: 'Department / Agency Logo', value: 'Logos' },
        { name: 'Graphics / Banners / PFP', value: 'Graphics' },
        { name: 'Custom Discord Bot Development', value: 'Bot Development' },
        { name: 'Discord Server Setup Bundle', value: 'Server Setup' }
      )
  );

export async function execute(interaction) {
  const chosenService = interaction.options.getString('service');

  if (chosenService) {
    const statusRecord = await getServiceStatus(chosenService);
    if (statusRecord && !statusRecord.is_open) {
      const warningEmbed = createWarningEmbed(
        `${chosenService} Commissions Temporarily Closed`,
        `We are currently operating at maximum queue capacity for **${chosenService}** commissions to ensure our quality standards remain uncompromised.`,
        [
          { name: 'Queue Status', value: '` 🔴 FULL CAPACITY `', inline: true },
          { name: 'Reopen Window', value: 'Expected within 5–7 business days', inline: true },
          { name: 'Alternative Option', value: 'Check `/services` or open a General Support ticket if you have an urgent inquiry.', inline: false }
        ]
      );
      return interaction.reply({
        embeds: [warningEmbed],
        ephemeral: true
      });
    }
  }

  // Show guided design order modal
  const modal = buildDesignOrderModal();
  await interaction.showModal(modal);
}

export default { data, execute };
