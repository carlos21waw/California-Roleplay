import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder, addOrderHistory, incrementUserProfile } from '../../database/db.js';
import { isDesigner, isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('order-complete')
  .setDescription('Mark an order as completed and delivered to customer')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID to mark completed').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('delivery_notes').setDescription('Optional notes regarding files, delivery, or links').setRequired(false)
  );

export async function execute(interaction) {
  if (!isDesigner(interaction.member) && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only authorized designers or staff can mark orders complete.')],
      ephemeral: true
    });
  }

  const orderId = interaction.options.getString('order_id').toUpperCase();
  const notes = interaction.options.getString('delivery_notes') || 'Delivered to client.';
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Order \`${orderId}\` does not exist.`)],
      ephemeral: true
    });
  }

  await updateOrder(orderId, {
    status: 'Completed',
    completed_at: Date.now()
  });
  await addOrderHistory(orderId, interaction.user.id, order.status, 'Completed', notes);
  await incrementUserProfile(order.user_id, 'orders_completed', 1);

  // Notify customer via DM if possible
  try {
    const customer = await interaction.client.users.fetch(order.user_id).catch(() => null);
    if (customer) {
      await customer.send({
        embeds: [
          createSuccessEmbed(
            'Your Silence Designs Order is Complete! 🎉',
            `Your order **${orderId}** (\`${order.service_type}\`) has been completed!\n\n` +
            `**Designer:** <@${interaction.user.id}>\n` +
            `**Notes:** ${notes}\n\n` +
            `Please run \`/order-review\` to leave a review and rating for your designer!`
          )
        ]
      }).catch(() => null);
    }
  } catch {
    // Ignore DM error
  }

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Order Completed',
        `Order **${orderId}** has been marked as **Completed**.\n• **Customer:** <@${order.user_id}>\n• **Delivery Notes:** ${notes}`
      )
    ]
  });
}

export default { data, execute };
