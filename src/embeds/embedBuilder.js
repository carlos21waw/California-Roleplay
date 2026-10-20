import { EmbedBuilder } from 'discord.js';
import config from '../config/config.js';

/**
 * Creates a base Silence Designs branded EmbedBuilder with default styling
 */
export function createBaseEmbed(options = {}) {
  const embed = new EmbedBuilder()
    .setColor(options.color || config.colors.primary)
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
      text: options.footerText || 'SILENCE DESIGNS — Your vision. Our design.',
      iconURL: options.footerIcon || undefined
    });
  }

  if (options.thumbnail) {
    embed.setThumbnail(options.thumbnail);
  }

  if (options.image) {
    embed.setImage(options.image);
  }

  if (options.fields && Array.isArray(options.fields)) {
    embed.addFields(options.fields);
  }

  return embed;
}

export function createSuccessEmbed(title, description, fields = []) {
  return createBaseEmbed({
    title: `✅  ${title}`,
    description,
    color: config.colors.success,
    fields
  });
}

export function createErrorEmbed(title, description) {
  return createBaseEmbed({
    title: `❌  ${title}`,
    description,
    color: config.colors.error
  });
}

export function createWarningEmbed(title, description) {
  return createBaseEmbed({
    title: `⚠️  ${title}`,
    description,
    color: config.colors.warning
  });
}

export function createInfoEmbed(title, description, fields = []) {
  return createBaseEmbed({
    title: `💎  ${title}`,
    description,
    color: config.colors.accent,
    fields
  });
}

export function createModerationEmbed(action, targetUser, moderator, reason, extraFields = []) {
  return createBaseEmbed({
    title: `🛡️ Moderation Action — ${action}`,
    color: config.colors.moderation,
    fields: [
      { name: 'Target User', value: `<@${targetUser.id}> (\`${targetUser.id}\`)`, inline: true },
      { name: 'Moderator', value: `<@${moderator.id}>`, inline: true },
      { name: 'Reason', value: reason || 'No reason specified', inline: false },
      ...extraFields
    ]
  });
}

/**
 * Section 7: Support Ticket Welcome Embed
 */
export function createTicketWelcomeEmbed(user, refId, category, inquiry, robloxUsername = null, robloxJoinDate = null) {
  const fields = [
    { name: 'Ticket Creator', value: `<@${user.id}>`, inline: true },
    { name: 'Category', value: `\`${category}\``, inline: true },
    { name: 'Reference ID', value: `\`${refId}\``, inline: true }
  ];

  if (robloxUsername && robloxUsername !== 'Not Provided') {
    fields.push({
      name: 'Roblox Account',
      value: `[${robloxUsername}](https://www.roblox.com/users/profile?username=${encodeURIComponent(robloxUsername)})`,
      inline: true
    });
  }

  if (robloxJoinDate) {
    fields.push({
      name: 'Roblox Joined',
      value: String(robloxJoinDate),
      inline: true
    });
  }

  fields.push({
    name: 'Customer Inquiry',
    value: inquiry ? `>>> ${inquiry.slice(0, 1000)}` : 'No details provided.',
    inline: false
  });

  return createBaseEmbed({
    title: `Thanks for contacting support — @${user.username}`,
    description: 'A member of our team will assist you shortly. Provide all relevant information regarding your issue. Kindly refrain from pinging agents while waiting for a response.',
    color: config.colors.primary,
    fields
  });
}

/**
 * Section 8: Ticket Closure Receipt Embed
 */
export function createTicketReceiptEmbed(handler, refId, reason = 'Has been resolved.') {
  return createBaseEmbed({
    title: 'Ticket Closure Receipt',
    description: 'Your support ticket was resolved and has now been closed.\n\n> If you believe this ticket was closed in error or you need further assistance regarding the same issue, you may open a new ticket and include the Reference ID above so staff can quickly locate the previous conversation. Thank you for contacting us!',
    color: config.colors.primary,
    fields: [
      { name: 'Handler', value: handler ? `<@${handler.id}>` : 'Silence Staff', inline: true },
      { name: 'Reference ID', value: `\`${refId}\``, inline: true },
      { name: 'Closure Reason', value: `\`${reason}\``, inline: true },
      { name: 'Closure Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
    ]
  });
}

export default {
  createBaseEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createWarningEmbed,
  createInfoEmbed,
  createModerationEmbed,
  createTicketWelcomeEmbed,
  createTicketReceiptEmbed
};
