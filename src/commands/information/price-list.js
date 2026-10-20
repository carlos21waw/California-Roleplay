import { SlashCommandBuilder } from 'discord.js';
import products from '../../config/products.js';
import rules from '../../config/rules.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('price-list')
  .setDescription('Display the official Silence Designs design services and price list');

export async function execute(interaction) {
  const fields = products.designPrices.map(item => ({
    name: `${item.service} — Price: ${item.priceRange}`,
    value: item.description,
    inline: false
  }));

  fields.push({
    name: '📝 How to Order',
    value: 'When placing an order, please provide:\n• Username\n• What are you ordering?\n• Description of what you want\n• Preferred colors\n• Text to include\n• Reference images, if any\n• Any extra details',
    inline: false
  });

  fields.push({
    name: '⚠️ Order Rules',
    value: rules.orderRules.slice(0, 5).map(r => `• ${r}`).join('\n'),
    inline: false
  });

  const embed = createBaseEmbed({
    title: 'DESIGN SERVICES & PRICES',
    description: 'Welcome to Silence Designs! Below is our official design service pricing catalog. Open a ticket or contact an authorized designer to place your order.',
    color: 0x181B22,
    fields,
    footerText: 'SILENCE DESIGNS — Your vision. Our design. • Open a ticket to place an order.'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
