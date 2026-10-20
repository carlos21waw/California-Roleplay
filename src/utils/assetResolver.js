import fs from 'fs';
import path from 'path';
import { AttachmentBuilder } from 'discord.js';
import config from '../config/config.js';

/**
 * Safely resolves an asset file path or creates an AttachmentBuilder.
 * Never throws if the asset does not exist on disk.
 */
export function getAssetPath(category, filename) {
  try {
    const dir = config.assets[category] || path.join(config.assets.rootDir, category);
    const fullPath = path.join(dir, filename.endsWith('.png') ? filename : `${filename}.png`);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * Creates an AttachmentBuilder for an asset if it exists.
 * Returns null if the file does not exist, preventing discord.js crash.
 */
export function getAssetAttachment(category, filename, attachmentName) {
  const filePath = getAssetPath(category, filename);
  if (!filePath) return null;
  const name = attachmentName || path.basename(filePath);
  return new AttachmentBuilder(filePath, { name });
}

/**
 * Standard asset lookup mapping
 */
export const assetMap = {
  // Command Thumbnails / Banners
  'order-create': 'commands/order-create.png',
  'order-status': 'commands/order-status.png',
  'order-list': 'commands/order-list.png',
  'ticket-open': 'commands/ticket-open.png',
  'server-info': 'commands/server-info.png',
  'price-list': 'commands/price-list.png',
  'showcase': 'commands/showcase.png',
  'rules': 'commands/rules.png',

  // Panels
  'ticket-panel': 'banners/ticket-panel.png',
  'store-panel': 'banners/store.png',
  'services-panel': 'banners/services.png',
  'faq-panel': 'banners/faq.png',
  'marketplace-panel': 'banners/marketplace.png',

  // Footers & Branding
  'footer': 'footers/silence-designs-footer.png',
  'logo': 'branding/silence-designs-logo.png'
};

export default {
  getAssetPath,
  getAssetAttachment,
  assetMap
};
