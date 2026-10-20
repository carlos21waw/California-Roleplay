import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getOrder } from '../../database/db.js';
import { createOrderCard, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('order-status')
  .setDescription('Lookup the comprehensive real-time status card of a commission')
  .addStringOption(option =>
    option
      .setName('order_id')
      .setDescription('The unique Order ID (e.g. ORD-B2EB6F)')
      .setRequired(true)
  );

export async function execute(interaction) {
  const orderId = interaction.options.getString('order_id').toUpperCase().trim();
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Commission Not Found',
          `No active or archived commission record exists under identifier \`${orderId}\`.`,
          'ERR_ORDER_NOT_FOUND',
          'Please verify the Order ID with `/order-list` or contact staff if you believe this is an error.'
        )
      ],
      ephemeral: true
    });
  }

  const orderCard = createOrderCard(order);

  const row = new ActionRowBuilder();
  if (order.status === 'Completed' && !order.review) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`order_review_prompt_${order.id}`)
        .setLabel('Submit Review')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⭐')
    );
  }
  if (order.designer_id) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`order_tip_btn_${order.id}`)
        .setLabel('Tip Designer')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💖')
    );
  }

  await interaction.reply({
    embeds: [orderCard],
    components: row.components.length > 0 ? [row] : []
  });
}

export default { data, execute };
