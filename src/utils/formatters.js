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
 * Formats Robux amount into a clean, premium string
 */
export function formatRobux(amount) {
  if (typeof amount === 'number') {
    return `R$${amount.toLocaleString()}`;
  }
  return String(amount || 'R$0');
}

/**
 * Generates an immutable, cryptographic reference ID (e.g. REF-B2EB6F7E, ORD-89FA21)
 */
export function generateRefId(prefix = 'REF') {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${randomHex}`;
}

/**
 * Converts a timestamp to Discord format tags
 * Default 'f' (e.g. October 19, 2026 11:45 PM), 'R' (relative time)
 */
export function formatDiscordTimestamp(timestamp, style = 'f') {
  const unixSec = Math.floor(new Date(timestamp).getTime() / 1000);
  return `<t:${unixSec}:${style}>`;
}

export function formatRelativeTimestamp(timestamp) {
  const unixSec = Math.floor(new Date(timestamp).getTime() / 1000);
  return `<t:${unixSec}:R>`;
}

/**
 * Renders a clean ASCII visual progress bar for orders, timelines, and milestones
 */
export function renderProgressBar(percentage, length = 10) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const filledCount = Math.round((clamped / 100) * length);
  const emptyCount = length - filledCount;
  const bar = '■'.repeat(filledCount) + '□'.repeat(emptyCount);
  return `\`[${bar}]\` **${clamped}%**`;
}

/**
 * Returns formatted luxury status badges for orders & tickets
 */
export function getStatusBadge(status) {
  const badges = {
    'Pending': '` ⏳ PENDING `',
    'Awaiting Payment': '` 💳 AWAITING PAYMENT `',
    'In Progress': '` ⚙️ IN PRODUCTION `',
    'Awaiting Customer': '` 👤 PENDING REVIEW `',
    'Completed': '` ✅ COMPLETED `',
    'Cancelled': '` ✖️ CANCELLED `',
    'Denied': '` 🚫 DENIED `',
    'Open': '` 🟢 OPEN `',
    'Claimed': '` 🟡 CLAIMED `',
    'Closed': '` ⚪ CLOSED `'
  };
  return badges[status] || `\` ${status.toUpperCase()} \``;
}

/**
 * Clean status progress step indicator for order lifecycle
 */
export function getOrderStageProgress(status) {
  switch (status) {
    case 'Pending':
      return { step: '1 of 4 • Received', progress: 25 };
    case 'Awaiting Payment':
      return { step: '2 of 4 • Payment Required', progress: 40 };
    case 'In Progress':
      return { step: '3 of 4 • In Active Design', progress: 75 };
    case 'Awaiting Customer':
      return { step: '3 of 4 • Proof Pending Approval', progress: 90 };
    case 'Completed':
      return { step: '4 of 4 • Delivered & Finalized', progress: 100 };
    case 'Cancelled':
    case 'Denied':
      return { step: 'Terminated', progress: 0 };
    default:
      return { step: 'Processing', progress: 50 };
  }
}

export default {
  safeText,
  formatRobux,
  generateRefId,
  formatDiscordTimestamp,
  formatRelativeTimestamp,
  renderProgressBar,
  getStatusBadge,
  getOrderStageProgress
};
