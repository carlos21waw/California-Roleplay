import { SlashCommandBuilder } from 'discord.js';
import { getOrder, incrementUserProfile } from '../../database/db.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import products from '../../config/products.js';

export const data = new SlashCommandBuilder()
  .setName('order-tip')
  .setDescription('Send a tip or donation link to support your designer')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID').setRequired(true)
  );

export async function execute(interaction) {
  const orderId = interaction.options.getString('order_id').toUpperCase();
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Order \`${orderId}\` was not found.`)],
      ephemeral: true
    });
  }

  await incrementUserProfile(interaction.user.id, 'tips_given', 1);

  const embed = createBaseEmbed({
    title: `💖 Tip Your Designer — Order ${orderId}`,
    description: `Thank you for considering tipping our creative team! Tips directly motivate designers and fund ER:LC community templates.\n\n` +
      `**Assigned Designer:** ${order.designer_id ? `<@${order.designer_id}>` : 'Silence Designs Team'}\n` +
      `**Service:** \`${order.service_type}\`\n\n` +
      `**Tip Options via Roblox Developer Products:**\n` +
      `• [Small Tip (R$200)](${products.donations.tiers[0].url})\n` +
      `• [Medium Tip (R$500)](${products.donations.tiers[1].url})\n` +
      `• [Large Tip (R$1,000)](${products.donations.tiers[2].url})`,
    color: 0xEC4899,
    footerText: 'Thank you for supporting Silence Designs creators!'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
