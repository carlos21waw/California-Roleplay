import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder, addOrderHistory } from '../../database/db.js';
import { isStaff, isDesigner } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('order-cancel')
  .setDescription('Cancel an active order (Customer or Staff)')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID to cancel').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason').setDescription('Reason for cancellation').setRequired(false)
  );

export async function execute(interaction) {
  const orderId = interaction.options.getString('order_id').toUpperCase();
  const reason = interaction.options.getString('reason') || 'No reason specified';
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Order \`${orderId}\` does not exist.`)],
      ephemeral: true
    });
  }

  // Authorization check: creator or staff/designer
  const isCreator = order.user_id === interaction.user.id;
  const isAuthorized = isStaff(interaction.member) || isDesigner(interaction.member);

  if (!isCreator && !isAuthorized) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You can only cancel your own orders unless you are an authorized staff member.')],
      ephemeral: true
    });
  }

  if (order.status === 'Completed' || order.status === 'Cancelled') {
    return interaction.reply({
      embeds: [createErrorEmbed('Invalid Action', `This order is already marked as \`${order.status}\`.`)],
      ephemeral: true
    });
  }

  await updateOrder(orderId, { status: 'Cancelled' });
  await addOrderHistory(orderId, interaction.user.id, order.status, 'Cancelled', reason);

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Order Cancelled',
        `Order **${orderId}** has been marked as **Cancelled**.\n• **Cancelled By:** <@${interaction.user.id}>\n• **Reason:** ${reason}`
      )
    ]
  });
}

export default { data, execute };
