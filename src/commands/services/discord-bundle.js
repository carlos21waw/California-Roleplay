import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import products from '../../config/products.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('discord-bundle')
  .setDescription('View the Silence Designs Discord Server Bundle setup package');

export async function execute(interaction) {
  const bundle = products.bundles.serverBundle;

  const embed = createBaseEmbed({
    title: `🛡️ ${bundle.name} — Information`,
    description: `Complete turnkey configuration for your roleplay department or community server.\n\n` +
      `**Starts at ${bundle.startingPrice}.**\n` +
      `${bundle.description}\n\n` +
      `*Note: Bot setup is optional. Requesting additional bots within the supported maximum may adjust the final quote.*`,
    color: 0x8B5CF6,
    fields: [
      {
        name: "What's Included?",
        value: bundle.items.map(i => `• ${i}`).join('\n')
      }
    ],
    footerText: 'SILENCE DESIGNS — Professional Discord Setup'
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_order_start_bundle')
      .setLabel('Order Server Bundle')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🛠️')
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

export default { data, execute };
