import { EmbedBuilder } from 'discord.js';
import config from '../config/config.js';
import { getStatusBadge, getOrderStageProgress, renderProgressBar, formatDiscordTimestamp, formatRelativeTimestamp } from '../utils/formatters.js';

/**
 * Creates a base Silence Designs branded EmbedBuilder with luxury styling
 */
export function createBaseEmbed(options = {}) {
  const embed = new EmbedBuilder()
    .setColor(options.color !== undefined ? options.color : config.colors.primary)
    .setTimestamp(options.timestamp !== false ? (options.timestamp || new Date()) : null);

  if (options.title) {
    embed.setTitle(options.title);
  }

  if (options.description) {
    embed.setDescription(options.description);
  }

  // Author header
  if (options.author) {
    embed.setAuthor(options.author);
  } else if (options.showDefaultAuthor !== false) {
    embed.setAuthor({
      name: options.authorName || 'Silence Designs • ER:LC Custom Works',
      iconURL: options.authorIcon || 'https://raw.githubusercontent.com/discord/discord-api-docs/main/assets/brand-assets/discord-mark-blue.png'
    });
  }

  // Footer
  if (options.footer) {
    embed.setFooter(options.footer);
  } else {
    embed.setFooter({
      text: options.footerText || config.footerText || 'Silence Designs • Premium Experience',
      iconURL: options.footerIcon || undefined
    });
  }

  if (options.thumbnail) {
    embed.setThumbnail(options.thumbnail);
  }

  if (options.image) {
    embed.setImage(options.image);
  }

  if (options.fields && Array.isArray(options.fields) && options.fields.length > 0) {
    embed.addFields(options.fields);
  }

  return embed;
}

/**
 * Luxury Success Embed with Action Badge & Guidance
 */
export function createSuccessEmbed(title, description, fields = [], nextSteps = null) {
  const allFields = [...fields];
  if (nextSteps) {
    allFields.push({
      name: 'Next Steps',
      value: nextSteps,
      inline: false
    });
  }

  return createBaseEmbed({
    title: `✦ ${title}`,
    description: description ? `> ${description}` : undefined,
    color: config.colors.success,
    fields: allFields
  });
}

/**
 * Professional Error Embed with Error Code, Cause, and Resolution Tip
 */
export function createErrorEmbed(title, description, errorCode = null, resolution = null) {
  const fields = [];
  if (errorCode) {
    fields.push({ name: 'Reference Code', value: `\`${errorCode}\``, inline: true });
  }
  if (resolution) {
    fields.push({ name: 'Recommended Action', value: resolution, inline: false });
  }

  return createBaseEmbed({
    title: `✕ ${title}`,
    description: description ? `> ${description}` : 'An unexpected error occurred while executing this operation.',
    color: config.colors.error,
    fields
  });
}

/**
 * Refined Warning Embed
 */
export function createWarningEmbed(title, description, fields = []) {
  return createBaseEmbed({
    title: `⚠ ${title}`,
    description: description ? `> ${description}` : undefined,
    color: config.colors.warning,
    fields
  });
}

/**
 * Polished Information Embed
 */
export function createInfoEmbed(title, description, fields = []) {
  return createBaseEmbed({
    title: `✦ ${title}`,
    description,
    color: config.colors.accent,
    fields
  });
}

/**
 * Loading or Processing Embed
 */
export function createLoadingEmbed(actionText) {
  return createBaseEmbed({
    title: '⚙ Processing Request',
    description: `> ${actionText || 'Silence Designs is communicating with services...'}`,
    color: config.colors.silver
  });
}

/**
 * Premium Order Card with Progress Bar, Stage, and Metadata
 */
export function createOrderCard(order) {
  const stage = getOrderStageProgress(order.status);
  const progressBar = renderProgressBar(stage.progress, 12);

  const fields = [
    { name: 'Customer', value: `<@${order.user_id}> (\`${order.user_tag}\`)`, inline: true },
    {
      name: 'Roblox Profile',
      value: order.roblox_username ? `[${order.roblox_username}](https://www.roblox.com/search/users?keyword=${encodeURIComponent(order.roblox_username)})` : '*None provided*',
      inline: true
    },
    { name: 'Service Requested', value: `\`${order.service_type}\``, inline: true },
    { name: 'Assigned Designer', value: order.designer_id ? `<@${order.designer_id}>` : '*Unassigned*', inline: true },
    { name: 'Estimated Total', value: `\`${order.price_estimate || 'Pending Quote'}\``, inline: true },
    { name: 'Payment Status', value: order.payment_status === 'Paid' ? '` ✅ VERIFIED ` ' : '` 💳 UNPAID `', inline: true },
    {
      name: 'Production Stage',
      value: `${getStatusBadge(order.status)}\n${stage.step}\n${progressBar}`,
      inline: false
    },
    {
      name: 'Design Specifications',
      value: `• **Preferred Colors:** ${order.preferred_colors || 'Standard'}\n• **Requested Markings:** ${order.requested_text || 'Standard'}\n• **Overview:** ${order.description.slice(0, 300)}`,
      inline: false
    },
    { name: 'Created On', value: formatDiscordTimestamp(order.created_at, 'f'), inline: true },
    {
      name: 'Status Milestone',
      value: order.completed_at ? `Completed ${formatRelativeTimestamp(order.completed_at)}` : `Active (${formatRelativeTimestamp(order.created_at)})`,
      inline: true
    }
  ];

  if (order.review) {
    fields.push({
      name: 'Client Feedback',
      value: `⭐ **${order.rating}/5 Stars**\n> "${order.review}"`,
      inline: false
    });
  }

  return createBaseEmbed({
    title: `✦ Commission Card — ${order.id}`,
    color: order.status === 'Completed' ? config.colors.success : (order.status === 'Cancelled' ? config.colors.error : config.colors.accent),
    fields,
    footerText: `Silence Designs • Order Management System • ${order.id}`
  });
}

/**
 * Premium Support Ticket Welcome Embed
 */
export function createTicketWelcomeEmbed(user, refId, category, inquiry, robloxUsername = null, robloxJoinDate = null) {
  const fields = [
    { name: 'Ticket Creator', value: `<@${user.id}>`, inline: true },
    { name: 'Department / Category', value: `\`${category}\``, inline: true },
    { name: 'Reference ID', value: `\`${refId}\``, inline: true }
  ];

  if (robloxUsername && robloxUsername !== 'Not Provided') {
    fields.push({
      name: 'Roblox Username',
      value: `[${robloxUsername}](https://www.roblox.com/users/profile?username=${encodeURIComponent(robloxUsername)})`,
      inline: true
    });
  }

  if (robloxJoinDate) {
    fields.push({
      name: 'Roblox Account Created',
      value: String(robloxJoinDate),
      inline: true
    });
  }

  fields.push({
    name: 'Customer Inquiry / Specifications',
    value: inquiry ? `>>> ${inquiry.slice(0, 1000)}` : 'No details provided.',
    inline: false
  });

  fields.push({
    name: 'Staff Response Protocol',
    value: 'A verified representative will claim your ticket shortly. Kindly refrain from mass-pinging executive staff.',
    inline: false
  });

  return createBaseEmbed({
    title: `✦ Thanks for contacting support — @${user.username}`,
    description: 'Welcome to your private Silence Designs inquiry channel. Please provide any reference files, livery sketches, or asset links below.',
    color: config.colors.primary,
    fields,
    footerText: `Silence Designs • Support Protocol • ${refId}`
  });
}

/**
 * Premium Ticket Closure Receipt Embed
 */
export function createTicketReceiptEmbed(handler, refId, reason = 'Has been resolved.') {
  return createBaseEmbed({
    title: '✦ Ticket Closure Receipt',
    description: 'Your support ticket was resolved and has now been closed.\n\n> If you believe this ticket was closed in error or you need further assistance regarding the same issue, you may open a new ticket and include the Reference ID above so staff can quickly locate the previous conversation. Thank you for contacting us!',
    color: config.colors.primary,
    fields: [
      { name: 'Handling Representative', value: handler ? `<@${handler.id}>` : 'Silence Staff', inline: true },
      { name: 'Reference Identifier', value: `\`${refId}\``, inline: true },
      { name: 'Closure Resolution', value: `\`${reason}\``, inline: true },
      { name: 'Archived Timestamp', value: formatDiscordTimestamp(Date.now(), 'F'), inline: false }
    ],
    footerText: `Silence Designs • Ticket Audit System • ${refId}`
  });
}

/**
 * Premium Moderation Action Embed
 */
export function createModerationEmbed(action, targetUser, moderator, reason, extraFields = []) {
  return createBaseEmbed({
    title: `🛡️ Moderation Enforcement — ${action.toUpperCase()}`,
    color: config.colors.moderation,
    fields: [
      { name: 'Target Account', value: `<@${targetUser.id}>\n\`${targetUser.tag || targetUser.id}\``, inline: true },
      { name: 'Authorized Moderator', value: `<@${moderator.id}>\n\`${moderator.tag || moderator.id}\``, inline: true },
      { name: 'Enforcement Reason', value: `>>> ${reason || 'No specific reason documented'}`, inline: false },
      ...extraFields
    ],
    footerText: 'Silence Designs • Disciplinary & Audit Protocol'
  });
}

export default {
  createBaseEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createWarningEmbed,
  createInfoEmbed,
  createLoadingEmbed,
  createOrderCard,
  createTicketWelcomeEmbed,
  createTicketReceiptEmbed,
  createModerationEmbed
};
