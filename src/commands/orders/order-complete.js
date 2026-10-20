import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder, addOrderHistory, incrementUserProfile } from '../../database/db.js';
import { isDesigner, isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { formatDiscordTimestamp } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('order-complete')
  .setDescription('Mark a commission as completed and delivered to customer')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID to mark completed').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('delivery_notes').setDescription('Release notes, file format summary, or download instructions').setRequired(false)
  );

export async function execute(interaction) {
  if (!isDesigner(interaction.member) && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Permission Denied',
          'Only authorized designers or staff members can mark orders as complete.',
          'ERR_FORBIDDEN'
        )
      ],
      ephemeral: true
    });
  }

  const orderId = interaction.options.getString('order_id').toUpperCase().trim();
  const notes = interaction.options.getString('delivery_notes') || 'All commissioned files delivered and verified.';
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Commission Not Found',
          `Order record \`${orderId}\` does not exist in the database.`,
          'ERR_NOT_FOUND'
        )
      ],
      ephemeral: true
    });
  }

  const now = Date.now();
  await updateOrder(orderId, {
    status: 'Completed',
    completed_at: now
  });
  await addOrderHistory(orderId, interaction.user.id, order.status, 'Completed', notes);
  await incrementUserProfile(order.user_id, 'orders_completed', 1);

  // Notify customer via DM
  try {
    const customer = await interaction.client.users.fetch(order.user_id).catch(() => null);
    if (customer) {
      const dmEmbed = createSuccessEmbed(
        `Your Commission is Complete! 🎉`,
        `Your Silence Designs order **${orderId}** (\`${order.service_type}\`) has been finalized and delivered!`,
        [
          { name: 'Lead Designer', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Delivery Date', value: formatDiscordTimestamp(now, 'f'), inline: true },
          { name: 'Designer Notes', value: `>>> ${notes}`, inline: false }
        ],
        'We would love your feedback! Please run `/order-review` to rate your designer and leave a community review.'
      );
      await customer.send({ embeds: [dmEmbed] }).catch(() => null);
    }
  } catch {
    // Ignore DM failure
  }

  const staffEmbed = createSuccessEmbed(
    `Commission Finalized — ${orderId}`,
    `Order **${orderId}** has officially been marked as **Completed** in SQLite.`,
    [
      { name: 'Client Account', value: `<@${order.user_id}>`, inline: true },
      { name: 'Handling Designer', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Status Tag', value: '` ✅ COMPLETED `', inline: true },
      { name: 'Delivery Notes', value: `>>> ${notes}`, inline: false }
    ],
    'The client has been notified via DM and invited to submit a verified rating using `/order-review`.'
  );

  await interaction.reply({ embeds: [staffEmbed] });
}

export default { data, execute };
