import { SlashCommandBuilder } from 'discord.js';
import { getUserOrders, getAllOrders } from '../../database/db.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { getStatusBadge } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('order-list')
  .setDescription('List your active and past orders (or all orders for staff)')
  .addStringOption(option =>
    option
      .setName('status')
      .setDescription('Filter orders by status (Staff only)')
      .setRequired(false)
      .addChoices(
        { name: 'Pending', value: 'Pending' },
        { name: 'In Progress', value: 'In Progress' },
        { name: 'Awaiting Payment', value: 'Awaiting Payment' },
        { name: 'Completed', value: 'Completed' },
        { name: 'Cancelled', value: 'Cancelled' }
      )
  );

export async function execute(interaction) {
  const staffMode = isStaff(interaction.member);
  const filterStatus = interaction.options.getString('status');

  let orders = [];
  if (staffMode && filterStatus) {
    orders = await getAllOrders(filterStatus);
  } else if (staffMode) {
    orders = await getAllOrders();
  } else {
    orders = await getUserOrders(interaction.user.id);
  }

  if (!orders || orders.length === 0) {
    return interaction.reply({
      content: staffMode
        ? '📦 No orders found matching the filter criteria.'
        : '📦 You currently do not have any orders with Silence Designs. Use `/order-create` to get started!',
      ephemeral: true
    });
  }

  const items = orders.slice(0, 15).map(o =>
    `• **${o.id}** — \`${o.service_type}\` | ${getStatusBadge(o.status)} | Created: <t:${Math.floor(o.created_at / 1000)}:R>`
  );

  const embed = createBaseEmbed({
    title: staffMode ? `📋 All Orders Registry (${orders.length} total)` : `📦 Your Orders (${orders.length})`,
    description: items.join('\n') + (orders.length > 15 ? `\n\n*...and ${orders.length - 15} more orders.*` : ''),
    fields: [
      { name: 'Lookup Individual Order', value: 'Run `/order-status <order_id>` to view full details and history.' }
    ]
  });

  await interaction.reply({ embeds: [embed], ephemeral: !staffMode });
}

export default { data, execute };
