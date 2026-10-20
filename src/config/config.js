import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

export const config = {
  // Discord Credentials
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  ownerId: process.env.OWNER_ID || '1025813762684502168',
  developerTag: 'Carlos473',
  developerId: '1025813762684502168',

  // Bot Metadata
  botName: 'Silence Designs',
  botVersion: '1.0.0',
  tagline: 'Your vision. Our design.',
  masterServiceAgreementUrl: 'https://docs.google.com/document/d/16LXkFBEOPLBAr8trPBIIYXH53Wzbr_oFjjTtsO6hVmI/edit?usp=sharing',

  // Google Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // Server Roles
  roles: {
    executive: process.env.ROLE_EXECUTIVE_ID || '',
    management: process.env.ROLE_MANAGEMENT_ID || '',
    staff: process.env.ROLE_STAFF_ID || '',
    designer: process.env.ROLE_DESIGNER_ID || '',
    silencePlus: process.env.ROLE_SILENCE_PLUS_ID || '',
    booster: process.env.ROLE_BOOSTER_ID || '',
    donator: process.env.ROLE_DONATOR_ID || '',
    releasesPing: process.env.ROLE_RELEASES_PING_ID || ''
  },

  // Server Channels & Categories
  channels: {
    logs: process.env.CHANNEL_LOGS_ID || '',
    transcripts: process.env.CHANNEL_TRANSCRIPTS_ID || '',
    welcome: process.env.CHANNEL_WELCOME_ID || '',
    releases: process.env.CHANNEL_RELEASES_ID || '',
    giveaways: process.env.CHANNEL_GIVEAWAYS_ID || '',
    ads: process.env.CHANNEL_ADS_ID || '',
    ordersLog: process.env.CHANNEL_ORDERS_LOG_ID || '',
    ticketsCategory: process.env.CATEGORY_TICKETS_ID || '',
    ordersCategory: process.env.CATEGORY_ORDERS_ID || ''
  },

  // Branding Palette — Luxury Charcoal, Diamond & Silver
  colors: {
    primary: 0x16181D,     // Deep charcoal obsidian
    accent: 0x38BDF8,      // Signature diamond ice blue
    silver: 0xCBD5E1,      // Platinum silver
    dark: 0x0F1115,        // Carbon dark
    success: 0x10B981,     // Refined emerald
    warning: 0xF59E0B,     // Deep amber
    error: 0xEF4444,       // Crimson ruby
    moderation: 0x6366F1,  // Slate indigo
    giveaway: 0xEC4899,    // Neon rose
    store: 0x0EA5E9,       // Premium cyan
    gold: 0xF59E0B         // Platinum gold
  },
  footerText: 'Silence Designs • Premium Experience',

  // Asset Paths (Relative to project root)
  assets: {
    rootDir: path.join(rootDir, 'assets'),
    commands: path.join(rootDir, 'assets/commands'),
    banners: path.join(rootDir, 'assets/banners'),
    footers: path.join(rootDir, 'assets/footers'),
    thumbnails: path.join(rootDir, 'assets/thumbnails'),
    branding: path.join(rootDir, 'assets/branding'),
    releases: path.join(rootDir, 'assets/releases'),
    giveaways: path.join(rootDir, 'assets/giveaways'),
    services: path.join(rootDir, 'assets/services'),
    store: path.join(rootDir, 'assets/store')
  },

  // Roblox Community / Group Configuration
  roblox: {
    defaultGroupId: '34552481',
    defaultGroupName: 'ILE Customs',
    defaultGroupUrl: 'https://www.roblox.com/communities/34552481',
    defaultOwnerProfile: 'https://www.roblox.com/users/1010752321',
    defaultOwnerUsername: 'ileighlin',
    defaultDescription: 'ILE Customs has been a leading destination for design-focused servers since 2023, trusted by customers and designers as a leading choice in the industry.',
    referenceMemberCount: 2200,
    referenceCreatedDate: 'July 2, 2024'
  },

  // Database
  databasePath: process.env.DATABASE_PATH || path.join(rootDir, 'data/silence_designs.sqlite')
};

export default config;
