import crypto from 'crypto';

/**
 * Escapes user input to safely prevent unwanted Discord mentions (@everyone, @here, role pings)
 */
export function safeText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/@everyone/gi, '@\u200beveryone')
    .replace(/@here/gi, '@\u200bhere')
    .replace(/<@&(\d+)>/g, '@\u200brole');
}

/**
 * Formats Robux amount into clean string
 */
export function formatRobux(amount) {
  if (typeof amount === 'number') {
    return `R$${amount.toLocaleString()}`;
  }
  return String(amount);
}

/**
 * Generates a unique reference ID (e.g. REF-B2EB6F7E, ORD-89FA21)
 */
export function generateRefId(prefix = 'REF') {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${randomHex}`;
}

/**
 * Converts a timestamp to Discord format tags
 */
export function formatDiscordTimestamp(timestamp, style = 'f') {
  const unixSec = Math.floor(new Date(timestamp).getTime() / 1000);
  return `<t:${unixSec}:${style}>`;
}

/**
 * Returns formatted status badges for orders & tickets
 */
export function getStatusBadge(status) {
  const badges = {
    'Pending': '⏳ Pending',
    'Awaiting Payment': '💳 Awaiting Payment',
    'In Progress': '⚙️ In Progress',
    'Awaiting Customer': '👤 Awaiting Customer',
    'Completed': '✅ Completed',
    'Cancelled': '❌ Cancelled',
    'Denied': '🚫 Denied',
    'Open': '🟢 Open',
    'Claimed': '🟡 Claimed',
    'Closed': '🔴 Closed'
  };
  return badges[status] || status;
}

export default {
  safeText,
  formatRobux,
  generateRefId,
  formatDiscordTimestamp,
  getStatusBadge
};
