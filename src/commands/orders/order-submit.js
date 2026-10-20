import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder } from '../../database/db.js';
import { isDesigner, isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('order-submit')
  .setDescription('Submit a design draft, preview, or final file for an order')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID').setRequired(true)
  )
  .addAttachmentOption(option =>
    option.setName('file').setDescription('The preview image or delivery file').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('description').setDescription('Description of the draft or delivery').setRequired(false)
  );

export async function execute(interaction) {
  if (!isDesigner(interaction.member) && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only designers or staff can submit order deliveries.')],
      ephemeral: true
    });
  }

  const orderId = interaction.options.getString('order_id').toUpperCase();
  const file = interaction.options.getAttachment('file');
  const desc = interaction.options.getString('description') || 'Design draft / deliverable submitted.';

  const order = await getOrder(orderId);
  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed('Not Found', `Order \`${orderId}\` was not found.`)],
      ephemeral: true
    });
  }

  await updateOrder(orderId, {
    attachments: file.url,
    status: 'Awaiting Customer'
  });

  const embed = createSuccessEmbed(
    `Design Submitted for Order ${orderId}`,
    `**Designer:** <@${interaction.user.id}>\n` +
    `**Customer:** <@${order.user_id}>\n` +
    `**Notes:** ${desc}\n` +
    `**File Name:** \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)\n\n` +
    `Customer: Please review the attached file and let us know if revisions are needed!`
  );

  if (file.contentType?.startsWith('image/')) {
    embed.setImage(file.url);
  }

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
