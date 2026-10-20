import { SlashCommandBuilder } from 'discord.js';
import { getOrder } from '../../database/db.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { getStatusBadge } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('order-status')
  .setDescription('Check the real-time status and details of an order')
  .addStringOption(option =>
    option
      .setName('order_id')
      .setDescription('The unique Order ID (e.g. ORD-B2EB6F)')
      .setRequired(true)
  );

export async function execute(interaction) {
  const orderId = interaction.options.getString('order_id').toUpperCase();
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed('Order Not Found', `No active or past order was found with ID \`${orderId}\`.`)],
      ephemeral: true
    });
  }

  const embed = createBaseEmbed({
    title: `📦 Order Details — ${order.id}`,
    color: 0x38BDF8,
    fields: [
      { name: 'Customer', value: `<@${order.user_id}> (\`${order.user_tag}\`)`, inline: true },
      { name: 'Roblox Username', value: order.roblox_username ? `[${order.roblox_username}](https://www.roblox.com/search/users?keyword=${encodeURIComponent(order.roblox_username)})` : 'None', inline: true },
      { name: 'Service', value: `\`${order.service_type}\``, inline: true },
      { name: 'Current Status', value: getStatusBadge(order.status), inline: true },
      { name: 'Price Estimate', value: `\`${order.price_estimate || 'Pending Quote'}\``, inline: true },
      { name: 'Payment Status', value: order.payment_status === 'Paid' ? '✅ Paid' : '⏳ Unpaid / Pending', inline: true },
      { name: 'Assigned Designer', value: order.designer_id ? `<@${order.designer_id}>` : '*Unassigned*', inline: true },
      { name: 'Colors & Preferences', value: order.preferred_colors || 'None', inline: true },
      { name: 'Requested Text', value: order.requested_text || 'None', inline: true },
      { name: 'Description / Specifications', value: `>>> ${order.description}` },
      { name: 'Created At', value: `<t:${Math.floor(order.created_at / 1000)}:f>`, inline: true },
      { name: 'Completed At', value: order.completed_at ? `<t:${Math.floor(order.completed_at / 1000)}:f>` : '*In Progress*', inline: true }
    ]
  });

  if (order.review) {
    embed.addFields([
      { name: 'Customer Review', value: `⭐ **${order.rating}/5 Stars**\n"${order.review}"` }
    ]);
  }

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
