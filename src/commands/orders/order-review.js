import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder, incrementUserProfile } from '../../database/db.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { formatDiscordTimestamp } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('order-review')
  .setDescription('Submit a verified review and 1-5 star rating for your completed order')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The completed Order ID to review').setRequired(true)
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
  const orderId = interaction.options.getString('order_id').toUpperCase().trim();
  const rating = interaction.options.getInteger('rating');
  const feedback = interaction.options.getString('feedback');

  const order = await getOrder(orderId);
  if (!order) {
    return interaction.reply({
      embeds: [
        createErrorEmbed('Commission Not Found', `Order \`${orderId}\` does not exist.`, 'ERR_NOT_FOUND')
      ],
      ephemeral: true
    });
  }

  if (order.user_id !== interaction.user.id) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Permission Denied',
          'You may only leave reviews on commissions placed by your Discord account.',
          'ERR_UNAUTHORIZED'
        )
      ],
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

  const starSymbols = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const reviewEmbed = createSuccessEmbed(
    `Review Published — ${orderId}`,
    `Thank you for taking the time to share your experience with Silence Designs!`,
    [
      { name: 'Commission', value: `\`${order.id}\` (${order.service_type})`, inline: true },
      { name: 'Rating', value: `\` ${starSymbols} \` **${rating}/5**`, inline: true },
      { name: 'Designer', value: order.designer_id ? `<@${order.designer_id}>` : '*Unassigned*', inline: true },
      { name: 'Published', value: formatDiscordTimestamp(Date.now(), 'f'), inline: true },
      { name: 'Client Feedback', value: `>>> "${feedback}"`, inline: false }
    ],
    'Your review has been attached to your order record and added to our designer reputation registry.'
  );

  await interaction.reply({ embeds: [reviewEmbed] });
}

export default { data, execute };
