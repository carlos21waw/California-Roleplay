import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder, addOrderHistory } from '../../database/db.js';
import { isStaff, isDesigner } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { formatDiscordTimestamp } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('order-cancel')
  .setDescription('Cancel an active commission (Client or authorized Staff)')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID to cancel').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason').setDescription('Formal reason for cancellation').setRequired(false)
  );

export async function execute(interaction) {
  const orderId = interaction.options.getString('order_id').toUpperCase().trim();
  const reason = interaction.options.getString('reason') || 'Client / Staff requested cancellation.';
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Commission Not Found',
          `Order record \`${orderId}\` could not be located in the database.`,
          'ERR_NOT_FOUND',
          'Verify the Order ID using `/order-list`.'
        )
      ],
      ephemeral: true
    });
  }

  // Authorization check: creator or staff/designer
  const isCreator = order.user_id === interaction.user.id;
  const isAuthorized = isStaff(interaction.member) || isDesigner(interaction.member);

  if (!isCreator && !isAuthorized) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Permission Denied',
          'You may only cancel your own commissions unless you hold an authorized Staff role.',
          'ERR_FORBIDDEN',
          'If you need assistance with an order, contact the assigned designer directly.'
        )
      ],
      ephemeral: true
    });
  }

  if (order.status === 'Completed' || order.status === 'Cancelled') {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Invalid Cancellation Request',
          `This commission is already marked as \`${order.status}\` and cannot be altered.`,
          'ERR_ALREADY_FINALIZED'
        )
      ],
      ephemeral: true
    });
  }

  await updateOrder(orderId, { status: 'Cancelled' });
  await addOrderHistory(orderId, interaction.user.id, order.status, 'Cancelled', reason);

  const receiptEmbed = createSuccessEmbed(
    `Commission Cancelled — ${orderId}`,
    `Order **${orderId}** has been formally cancelled and archived in the database.`,
    [
      { name: 'Cancelled By', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Previous Status', value: `\`${order.status}\``, inline: true },
      { name: 'Timestamp', value: formatDiscordTimestamp(Date.now(), 'F'), inline: true },
      { name: 'Cancellation Reason', value: `>>> ${reason}`, inline: false }
    ],
    'If you have already submitted upfront payment, please contact Management in a Billing ticket for verification.'
  );

  await interaction.reply({ embeds: [receiptEmbed] });
}

export default { data, execute };
