import { SlashCommandBuilder } from 'discord.js';
import { getOrder, updateOrder } from '../../database/db.js';
import { isDesigner, isStaff } from '../../permissions/checkPermissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { formatDiscordTimestamp } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('order-submit')
  .setDescription('Submit an official design draft, proof, or deliverable file for an order')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID').setRequired(true)
  )
  .addAttachmentOption(option =>
    option.setName('file').setDescription('The preview image or delivery file').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('description').setDescription('Revision details, asset specifications, or client notes').setRequired(false)
  );

export async function execute(interaction) {
  if (!isDesigner(interaction.member) && !isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'Permission Denied',
          'Only verified designers or staff can submit official deliverables.',
          'ERR_FORBIDDEN'
        )
      ],
      ephemeral: true
    });
  }

  const orderId = interaction.options.getString('order_id').toUpperCase().trim();
  const file = interaction.options.getAttachment('file');
  const desc = interaction.options.getString('description') || 'Design draft / deliverable submitted for customer inspection.';

  const order = await getOrder(orderId);
  if (!order) {
    return interaction.reply({
      embeds: [
        createErrorEmbed('Commission Not Found', `Order record \`${orderId}\` was not found.`, 'ERR_NOT_FOUND')
      ],
      ephemeral: true
    });
  }

  await updateOrder(orderId, {
    attachments: file.url,
    status: 'Awaiting Customer'
  });

  const fileSizeKb = (file.size / 1024).toFixed(1);

  const embed = createSuccessEmbed(
    `Deliverable Proof Submitted — ${orderId}`,
    `An updated draft or final file has been uploaded for client review.`,
    [
      { name: 'Lead Designer', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Client Account', value: `<@${order.user_id}>`, inline: true },
      { name: 'Order Status', value: '` 👤 PENDING REVIEW `', inline: true },
      { name: 'Attached Asset', value: `\`${file.name}\` (${fileSizeKb} KB)`, inline: true },
      { name: 'Submitted At', value: formatDiscordTimestamp(Date.now(), 't'), inline: true },
      { name: 'Designer Notes', value: `>>> ${desc}`, inline: false }
    ],
    'Client: Please inspect the attached preview above. If revisions are required, discuss them here. If approved, staff will finalize completion.'
  );

  if (file.contentType?.startsWith('image/')) {
    embed.setImage(file.url);
  }

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
