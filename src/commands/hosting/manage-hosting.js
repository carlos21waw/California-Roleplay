import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getUserHosting, createHostingRecord, updateHosting } from '../../database/db.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed, createSuccessEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { generateRefId } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('manage-hosting')
  .setDescription('View and manage your hosted bot instances (or staff management)')
  .addSubcommand(sub =>
    sub
      .setName('view')
      .setDescription('View your active hosted bot records')
      .addUserOption(opt => opt.setName('user').setDescription('Target user (Staff only)').setRequired(false))
  )
  .addSubcommand(sub =>
    sub
      .setName('add')
      .setDescription('Register a new hosted bot record (Management only)')
      .addUserOption(opt => opt.setName('customer').setDescription('Client who owns the bot').setRequired(true))
      .addStringOption(opt => opt.setName('bot_name').setDescription('Bot Name / Client System').setRequired(true))
      .addStringOption(opt =>
        opt
          .setName('plan')
          .setDescription('Hosting Plan')
          .setRequired(true)
          .addChoices(
            { name: 'First 30 Days Free', value: '30 Days Free Trial' },
            { name: 'Monthly (30 Days)', value: 'Monthly (30 Days)' },
            { name: 'Quarterly (90 Days)', value: 'Quarterly (90 Days)' },
            { name: 'Bi-Annually (180 Days)', value: 'Bi-Annually (180 Days)' }
          )
      )
      .addIntegerOption(opt => opt.setName('duration_days').setDescription('Duration in days (e.g. 30, 90, 180)').setRequired(true))
      .addStringOption(opt => opt.setName('order_id').setDescription('Associated Order ID').setRequired(false))
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'add') {
    if (!isManagement(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed('Permission Denied', 'Only Management can add or modify hosting records.')],
        ephemeral: true
      });
    }

    const customer = interaction.options.getUser('customer');
    const botName = interaction.options.getString('bot_name');
    const plan = interaction.options.getString('plan');
    const days = interaction.options.getInteger('duration_days');
    const orderId = interaction.options.getString('order_id');

    const hostId = generateRefId('HOST');
    const now = Date.now();
    const expiresAt = now + (days * 86400000);

    await createHostingRecord({
      id: hostId,
      userId: customer.id,
      userTag: customer.tag,
      botName,
      orderId: orderId || null,
      plan,
      startDate: now,
      expiresAt,
      renewalInfo: `Renews on plan: ${plan}`
    });

    return interaction.reply({
      embeds: [
        createSuccessEmbed(
          'Hosting Record Created',
          `Created hosting profile **${hostId}** for <@${customer.id}>:\n` +
          `• **Bot Name:** \`${botName}\`\n` +
          `• **Plan:** \`${plan}\` (${days} days)\n` +
          `• **Expires:** <t:${Math.floor(expiresAt / 1000)}:f>`
        )
      ]
    });
  }

  // View subcommand
  const targetUser = (isManagement(interaction.member) && interaction.options.getUser('user'))
    ? interaction.options.getUser('user')
    : interaction.user;

  const records = await getUserHosting(targetUser.id);

  if (!records || records.length === 0) {
    const embed = createBaseEmbed({
      title: '🖥️ Bot Hosting Overview',
      description: `Hi, <@${targetUser.id}> — you currently do not have any bots hosted.\n\n` +
        `Bots ordered through Silence Designs include **30 days of free hosting** upon completion. Check \`/hosting-pricing\` to learn about our high-uptime infrastructure!`,
      color: 0x64748B
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('btn_open_order_ticket')
        .setLabel('Order a Bot')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🤖'),
      new ButtonBuilder()
        .setCustomId('btn_view_hosting_pricing')
        .setLabel('Hosting Pricing')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💳')
    );

    return interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
  }

  const fields = records.map(r => ({
    name: `🤖 ${r.bot_name} (${r.status})`,
    value: `• **Plan:** \`${r.plan}\`\n` +
      `• **Hosting ID:** \`${r.id}\`\n` +
      `• **Started:** <t:${Math.floor(r.start_date / 1000)}:d>\n` +
      `• **Expires:** <t:${Math.floor(r.expires_at / 1000)}:R> (<t:${Math.floor(r.expires_at / 1000)}:f>)\n` +
      `• **Renewal:** ${r.renewal_info}\n` +
      (r.order_id ? `• **Order Ref:** \`${r.order_id}\`` : ''),
    inline: false
  }));

  const embed = createBaseEmbed({
    title: `🖥️ Hosted Bots — @${targetUser.username} (${records.length})`,
    description: 'Active bot instances hosted by Silence Designs dedicated servers:',
    color: 0x38BDF8,
    fields
  });

  await interaction.reply({ embeds: [embed], ephemeral: targetUser.id === interaction.user.id });
}

export default { data, execute };
