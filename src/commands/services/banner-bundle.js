import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import products from '../../config/products.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('banner-bundle')
  .setDescription('View the Silence Designs Banner Bundle package details and start an order');

export async function execute(interaction) {
  const bundle = products.bundles.bannerBundle;

  const embed = createBaseEmbed({
    title: `🎨 ${bundle.name} — Information`,
    description: `Elevate your Discord server aesthetic with a unified high-resolution graphics suite.\n\n` +
      `**Starts at ${bundle.startingPrice}.**\n` +
      `${bundle.description}`,
    color: 0x38BDF8,
    fields: [
      {
        name: "What's Included?",
        value: bundle.items.map(i => `• ${i}`).join('\n')
      }
    ],
    footerText: 'SILENCE DESIGNS — Your vision. Our design.'
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_order_start_bundle')
      .setLabel('Order Banner Bundle')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✍️')
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

export default { data, execute };
