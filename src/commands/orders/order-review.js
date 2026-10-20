import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder, incrementUserProfile } from '../../database/db.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('order-review')
  .setDescription('Leave a review and 1-5 star rating for your completed order')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID to review').setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('rating')
      .setDescription('Rating from 1 to 5 stars')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(5)
  )
  .addStringOption(option =>
    option.setName('feedback').setDescription('Your detailed review feedback').setRequired(true)
  );

export async function execute(interaction) {
  const orderId = interaction.options.getString('order_id').toUpperCase();
  const rating = interaction.options.getInteger('rating');
  const feedback = interaction.options.getString('feedback');

  const order = await getOrder(orderId);
  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Order \`${orderId}\` does not exist.`)],
      ephemeral: true
    });
  }

  if (order.user_id !== interaction.user.id) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'You can only review orders that you placed.')],
      ephemeral: true
    });
  }

  await updateOrder(orderId, {
    review: feedback,
    rating
  });

  await incrementUserProfile(interaction.user.id, 'reviews_given', 1);
  if (order.designer_id) {
    await incrementUserProfile(order.designer_id, 'reputation', rating >= 4 ? 2 : 1);
  }

  const stars = '⭐'.repeat(rating);

  await interaction.reply({
    embeds: [
      createSuccessEmbed(
        'Thank You for Your Review!',
        `Your feedback for order **${orderId}** has been recorded:\n\n` +
        `• **Rating:** ${stars} (${rating}/5)\n` +
        `• **Designer:** ${order.designer_id ? `<@${order.designer_id}>` : '*Unassigned*'}\n` +
        `• **Feedback:** "${feedback}"\n\n` +
        `We appreciate you choosing Silence Designs!`
      )
    ]
  });
}

export default { data, execute };
