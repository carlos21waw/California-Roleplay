import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder, addOrderHistory } from '../../database/db.js';
import { isDesigner, isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { formatDiscordTimestamp } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('order-claim')
  .setDescription('Assign yourself as the primary designer handling a commission')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID to claim').setRequired(true)
  );

export async function execute(interaction) {
  if (!isDesigner(interaction.member) && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Permission Denied',
          'Only verified Silence Designs team members can claim commissions.',
          'ERR_DESIGNER_ONLY',
          'If you are an approved artist, ensure your Designer role is assigned.'
        )
      ],
      ephemeral: true
    });
  }

  const orderId = interaction.options.getString('order_id').toUpperCase().trim();
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Commission Not Found',
          `Order \`${orderId}\` was not found in the database.`,
          'ERR_NOT_FOUND'
        )
      ],
      ephemeral: true
    });
  }

  if (order.designer_id) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Commission Already Claimed',
          `This order is already claimed by <@${order.designer_id}>. Use \`/ticket-transfer\` if reassignment is needed.`,
          'ERR_ALREADY_CLAIMED'
        )
      ],
      ephemeral: true
    });
  }

  await updateOrder(orderId, {
    designer_id: interaction.user.id,
    status: order.status === 'Pending' ? 'In Progress' : order.status
  });
  await addOrderHistory(orderId, interaction.user.id, order.status, 'In Progress', `Claimed by designer ${interaction.user.tag}`);

  const embed = createSuccessEmbed(
    `Commission Claimed — ${orderId}`,
    `You have officially been assigned to Order **${orderId}**.`,
    [
      { name: 'Lead Designer', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Client Account', value: `<@${order.user_id}>`, inline: true },
      { name: 'Service', value: `\`${order.service_type}\``, inline: true },
      { name: 'Production Status', value: '` ⚙️ IN PRODUCTION `', inline: true },
      { name: 'Timestamp', value: formatDiscordTimestamp(Date.now(), 'f'), inline: true },
      { name: 'Client Specifications', value: `>>> ${order.description.slice(0, 300)}`, inline: false }
    ],
    'Please introduce yourself in the client ticket channel and confirm initial design mockups.'
  );

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
