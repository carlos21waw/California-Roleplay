import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder, addOrderHistory } from '../../database/db.js';
import { isDesigner, isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('order-claim')
  .setDescription('Assign yourself as the designer handling an order')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID to claim').setRequired(true)
  );

export async function execute(interaction) {
  if (!isDesigner(interaction.member) && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only verified Silence Designs team members can claim orders.')],
      ephemeral: true
    });
  }

  const orderId = interaction.options.getString('order_id').toUpperCase();
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Order \`${orderId}\` does not exist.`)],
      ephemeral: true
    });
  }

  if (order.designer_id) {
    return interaction.reply({
      embeds: [createErrorEmbed('Already Claimed', `This order is already claimed by <@${order.designer_id}>.`)],
      ephemeral: true
    });
  }

  await updateOrder(orderId, {
    designer_id: interaction.user.id,
    status: order.status === 'Pending' ? 'In Progress' : order.status
  });
  await addOrderHistory(orderId, interaction.user.id, order.status, 'In Progress', 'Claimed by designer');

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Order Claimed',
        `You have claimed Order **${orderId}**!\n• **Customer:** <@${order.user_id}>\n• **Service:** \`${order.service_type}\`\n• **Status:** \`In Progress\``
      )
    ]
  });
}

export default { data, execute };
