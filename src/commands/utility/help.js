import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Browse all 50+ slash commands categorized for Silence Designs')
  .addStringOption(option =>
    option
      .setName('category')
      .setDescription('Filter by category')
      .setRequired(false)
      .addChoices(
        { name: 'Orders (10 commands)', value: 'orders' },
        { name: 'AI Assistance (5 commands)', value: 'ai' },
        { name: 'Tickets & Support (8 commands)', value: 'tickets' },
        { name: 'Applications (5 commands)', value: 'apps' },
        { name: 'Information (6 commands)', value: 'info' },
        { name: 'Moderation (10 commands)', value: 'mod' },
        { name: 'Utility (6 commands)', value: 'util' },
        { name: 'Panels & Management', value: 'mgmt' }
      )
  );

export async function execute(interaction) {
  const cat = interaction.options.getString('category');

  if (cat === 'orders') {
    const embed = createBaseEmbed({
      title: '📦 Order Commands (10)',
      description: [
        '`/order-create` — Open guided modal or select service to begin an order',
        '`/order-status <id>` — Check live status, designer, quote, and payment',
        '`/order-cancel <id>` — Cancel an active order (Customer or Staff)',
        '`/order-list` — List your orders (or all orders for staff)',
        '`/order-claim <id>` — Assign yourself as the designer for an order',
        '`/order-complete <id>` — Mark order as completed and delivered',
        '`/order-submit <id>` — Upload draft/preview file to customer',
        '`/order-review <id>` — Leave a 1-5 star review for your designer',
        '`/order-tip <id>` — Send a tip to support your designer',
        '`/showcase` — View recent completed deliveries and liveries'
      ].join('\n\n'),
      color: 0x38BDF8
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (cat === 'ai') {
    const embed = createBaseEmbed({
      title: '🔮 AI Design Assistance Commands (5)',
      description: [
        '`/ai-idea <theme>` — Generate innovative ER:LC livery concepts with Gemini AI',
        '`/ai-palette <style>` — Generate aesthetic 5-color palettes with Hex codes',
        '`/ai-lore <dept>` — Generate rich roleplay backstory and history',
        '`/ai-slogan <agency>` — Generate quarter-panel mottos and quotes',
        '`/ai-name <vibe>` — Generate realistic fictional county/city names'
      ].join('\n\n'),
      color: 0x8B5CF6
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (cat === 'tickets') {
    const embed = createBaseEmbed({
      title: '🎫 Tickets & Support Commands (8)',
      description: [
        '`/ticket-open [category]` — Open support, design, or report ticket',
        '`/ticket-close [reason]` — Close ticket and generate transcript receipt',
        '`/ticket-add <user>` — Grant member access to current ticket',
        '`/ticket-remove <user>` — Remove member from current ticket',
        '`/ticket-transcript [ref_id]` — Export conversation history text file',
        '`/ticket-claim` — Claim active ticket as handling staff member',
        '`/ticket-transfer <staff>` — Hand off ticket to another team member',
        '`/ticket-priority <level>` — Set priority (Low, Normal, High, Urgent)'
      ].join('\n\n'),
      color: 0x22C55E
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (cat === 'apps') {
    const embed = createBaseEmbed({
      title: '📋 Application Commands (5)',
      description: [
        '`/apply-designer` — Submit portfolio to join our design team',
        '`/apply-staff` — Apply for community moderation & management',
        '`/app-review <id>` — Inspect submitted applicant details (Management)',
        '`/app-accept <id>` — Accept application and assign role (Management)',
        '`/app-deny <id>` — Deny application with constructive feedback'
      ].join('\n\n'),
      color: 0xEAB308
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (cat === 'info') {
    const embed = createBaseEmbed({
      title: 'ℹ️ Information Commands (6)',
      description: [
        '`/server-info` — Display community member count, channels, boost stats',
        '`/rules [section]` — View server rules, order rules, and marketplace rules',
        '`/department-info` — Display Roblox group data, owner, and join links',
        '`/price-list` — Official Silence Designs design prices and how to order',
        '`/schedule` — Operational hours, release drop times, hiring waves',
        '`/announcement` — View latest official updates from the team'
      ].join('\n\n'),
      color: 0x06B6D4
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (cat === 'mod') {
    const embed = createBaseEmbed({
      title: '🛡️ Moderation Commands (10)',
      description: [
        '`/ban <user> [reason]` — Ban member from server with audit log',
        '`/kick <user> [reason]` — Kick member from server',
        '`/mute <user> <minutes> [reason]` — Timeout member with duration',
        '`/unmute <user> [reason]` — Remove timeout from member',
        '`/warn <user> <reason>` — Issue formal warning recorded in SQLite',
        '`/warnings [user]` — Inspect warning history and moderator notes',
        '`/clearwarn <user>` — Clear disciplinary warnings (Staff only)',
        '`/purge <amount>` — Bulk delete up to 100 messages',
        '`/lock [reason]` — Lock channel preventing member chats',
        '`/unlock` — Restore channel chat permissions'
      ].join('\n\n'),
      color: 0xEF4444
    });
    return interaction.reply({ embeds: [embed] });
  }

  if (cat === 'util') {
    const embed = createBaseEmbed({
      title: '🛠️ Utility Commands (6)',
      description: [
        '`/help [category]` — Browse all commands with interactive filters',
        '`/botinfo` — System stats, Node/discord.js version, uptime, and ping',
        '`/ping` — Check Discord API latency and websocket heartbeat',
        '`/profile [user]` — View Silence Designs client profile & order stats',
        '`/leaderboard` — View top clients and reputable community members',
        '`/credits` — Official developer credits and team contributors'
      ].join('\n\n'),
      color: 0x64748B
    });
    return interaction.reply({ embeds: [embed] });
  }

  // Full Overview
  const embed = createBaseEmbed({
    title: '💎 Silence Designs — Slash Commands Directory',
    description: 'Silence Designs is equipped with **50+ slash commands**, persistent tickets, order tracking, SQLite database storage, and AI assistance.\n\n' +
      '**Command Categories:**\n' +
      '• **Orders (10):** `/order-create`, `/order-status`, `/order-list`, `/order-claim`...\n' +
      '• **AI Assistance (5):** `/ai-idea`, `/ai-palette`, `/ai-lore`, `/ai-slogan`, `/ai-name`\n' +
      '• **Tickets (8):** `/ticket-open`, `/ticket-close`, `/ticket-add`, `/ticket-transcript`...\n' +
      '• **Applications (5):** `/apply-designer`, `/apply-staff`, `/app-review`...\n' +
      '• **Information (6):** `/server-info`, `/rules`, `/department-info`, `/price-list`...\n' +
      '• **Moderation (10):** `/ban`, `/kick`, `/mute`, `/warn`, `/warnings`, `/purge`...\n' +
      '• **Utility (6):** `/help`, `/botinfo`, `/ping`, `/profile`, `/leaderboard`, `/credits`\n' +
      '• **Panels & Store:** `/ticket-panel`, `/store-panel`, `/faq-panel`, `/service-panel`\n\n' +
      'Use `/help <category>` to view detailed command options and descriptions!',
    color: 0x181B22
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
