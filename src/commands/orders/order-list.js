import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { getUserOrders, getAllOrders } from '../../database/db.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { createBaseEmbed, createInfoEmbed } from '../../embeds/embedBuilder.js';
import { getStatusBadge, formatDiscordTimestamp } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('order-list')
  .setDescription('List your active & past orders, or search all orders (Staff)')
  .addStringOption(option =>
    option
      .setName('status')
      .setDescription('Filter orders by production status (Staff)')
      .setRequired(false)
      .addChoices(
        { name: 'Pending Review', value: 'Pending' },
        { name: 'Awaiting Payment', value: 'Awaiting Payment' },
        { name: 'In Production', value: 'In Progress' },
        { name: 'Completed & Delivered', value: 'Completed' },
        { name: 'Cancelled / Denied', value: 'Cancelled' }
      )
  );

export async function execute(interaction) {
  const staffMode = isStaff(interaction.member);
  const filterStatus = interaction.options.getString('status');

  let orders = [];
  if (staffMode && filterStatus) {
    orders = await getAllOrders(filterStatus);
  } else if (staffMode) {
    orders = await getAllOrders();
  } else {
    orders = await getUserOrders(interaction.user.id);
  }

  if (!orders || orders.length === 0) {
    const emptyEmbed = createInfoEmbed(
      'No Orders Found',
      staffMode
        ? `No orders matching filter criteria \`${filterStatus || 'ALL'}\` were found in the database.`
        : 'You do not have any active or past commissions with Silence Designs.\n\nUse `/order-create` to submit your first livery or asset commission!'
    );
    return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
  }

  const pageSize = 5;
  const totalPages = Math.ceil(orders.length / pageSize);
  let currentPage = 0;

  const buildPageEmbed = (page) => {
    const start = page * pageSize;
    const pageOrders = orders.slice(start, start + pageSize);

    const fields = pageOrders.map(o => ({
      name: `✦ ${o.id} • ${o.service_type}`,
      value: `• **Status:** ${getStatusBadge(o.status)}\n` +
        `• **Client:** <@${o.user_id}> | **Designer:** ${o.designer_id ? `<@${o.designer_id}>` : '*Unassigned*'}\n` +
        `• **Created:** ${formatDiscordTimestamp(o.created_at, 'd')} • [Details: \`/order-status ${o.id}\`]`,
      inline: false
    }));

    const activeCount = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
    const completedCount = orders.filter(o => o.status === 'Completed').length;

    return createBaseEmbed({
      title: staffMode ? `📋 Master Commission Registry (${orders.length} total)` : `📦 Your Commission History (${orders.length})`,
      description: `**Summary:** \`${activeCount} Active\` • \`${completedCount} Completed\` • Page **${page + 1}** of **${totalPages}**`,
      fields,
      footerText: `Silence Designs • Page ${page + 1}/${totalPages} • Use /order-status <id> for details`
    });
  };

  const buildRow = (page) => {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('btn_page_prev')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀')
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId('btn_page_next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('▶')
        .setDisabled(page >= totalPages - 1)
    );
  };

  const initialMessage = await interaction.reply({
    embeds: [buildPageEmbed(currentPage)],
    components: totalPages > 1 ? [buildRow(currentPage)] : [],
    ephemeral: !staffMode,
    fetchReply: true
  });

  if (totalPages <= 1) return;

  const collector = initialMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120000
  });

  collector.on('collect', async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({ content: 'Only the command invoker can control pagination.', ephemeral: true });
    }

    if (i.customId === 'btn_page_prev' && currentPage > 0) {
      currentPage--;
    } else if (i.customId === 'btn_page_next' && currentPage < totalPages - 1) {
      currentPage++;
    }

    await i.update({
      embeds: [buildPageEmbed(currentPage)],
      components: [buildRow(currentPage)]
    });
  });

  collector.on('end', async () => {
    const disabledRow = buildRow(currentPage);
    disabledRow.components.forEach(btn => btn.setDisabled(true));
    await interaction.editReply({ components: [disabledRow] }).catch(() => null);
  });
}

export default { data, execute };
