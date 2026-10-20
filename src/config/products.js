/**
 * Silence Designs — Products, Store, and Pricing Configuration
 * Centralized reference for all Roblox game passes, developer products, and pricing.
 */

export const products = {
  // Silence Designs+ Membership
  membership: {
    id: 'silence_plus',
    name: 'Silence Designs+ Membership',
    priceRobux: 650,
    priceDisplay: 'R$650',
    url: 'https://www.roblox.com/developer-product/9860922544/product/3602207934',
    description: 'Browse the various benefits offered to our Silence Designs+ members. Choose Robux or USD where supported to purchase your membership.',
    benefits: [
      'Exclusive `@Silence Designs+` role',
      'Media permissions across text channels',
      'Special chat access, exclusive giveaways, and sneak peeks',
      '10% discount on all eligible design orders',
      'Privileged order placement in queue',
      'Early access to eligible releases (15 minutes prior to public drop)',
      'Exclusive free releases and member-only giveaways'
    ]
  },

  // Server Booster Perks
  boosterPerks: {
    name: 'Server Booster Perks',
    description: 'Are you interested in supporting our server by boosting? Below, you can find all the benefits offered to our Server Boosters! We appreciate every boost.',
    benefits: [
      'Exclusive `@Booster` role',
      'Special chat access, exclusive giveaways, and community releases',
      'Media permissions across public channels',
      '5% discount on all eligible design orders'
    ]
  },

  // Community Donations
  donations: {
    description: 'We are grateful for your interest in supporting Silence Designs. Your contribution helps fund projects and events within our community. We appreciate every donation.',
    benefits: [
      'Exclusive `@Donator` role',
      'Media permissions',
      'Special chat access, giveaways, and community releases',
      'Direct contribution to community assets and ER:LC projects',
      'Support for community events and future development'
    ],
    tiers: [
      {
        id: 'donation_small',
        name: 'Small Donation',
        priceRobux: 200,
        priceDisplay: 'R$200',
        url: 'https://www.roblox.com/developer-product/9860922544/product/3602207945'
      },
      {
        id: 'donation_medium',
        name: 'Medium Donation',
        priceRobux: 500,
        priceDisplay: 'R$500',
        url: 'https://www.roblox.com/developer-product/9860922544/product/3602207952'
      },
      {
        id: 'donation_large',
        name: 'Large Donation',
        priceRobux: 1000,
        priceDisplay: 'R$1,000',
        url: 'https://www.roblox.com/developer-product/9860922544/product/3602207963'
      }
    ]
  },

  // Store Advertisements Pricing
  storeAds: {
    description: 'Welcome to our advertisements selection. Find effective ways to promote your server through paid advertisements and sponsored giveaways.\n\nSponsored giveaway prizes must meet the minimum R$500 value and must be funded by the purchaser. Advertisements and giveaways may have a queue.',
    items: [
      {
        id: 'ad_instant_postage',
        name: 'Instant Postage',
        priceRobux: 2500,
        priceDisplay: 'R$2,500',
        url: 'https://www.roblox.com/developer-product/9860922544/product/3604739906',
        description: 'Post your advertisement immediately upon staff approval, skipping the entire queue.'
      },
      {
        id: 'ad_bypass_queue',
        name: 'Bypass Queue',
        priceRobux: 1250,
        priceDisplay: 'R$1,250',
        url: 'https://www.roblox.com/developer-product/9860922544/product/3602207982',
        description: 'Move to the front of the standard advertisement queue.'
      },
      {
        id: 'ad_everyone_ping',
        name: 'Everyone Ping',
        priceRobux: 1000,
        priceDisplay: 'R$1,000',
        url: 'https://www.roblox.com/developer-product/9860922544/product/3602207995',
        description: 'Announcement with @everyone notification.'
      },
      {
        id: 'ad_here_ping',
        name: 'Here Ping',
        priceRobux: 600,
        priceDisplay: 'R$600',
        url: 'https://www.roblox.com/developer-product/9860922544/product/3602208008',
        description: 'Announcement with @here notification.'
      },
      {
        id: 'ad_no_ping',
        name: 'No Ping',
        priceRobux: 300,
        priceDisplay: 'R$300',
        url: 'https://www.roblox.com/developer-product/9860922544/product/3602208027',
        description: 'Silent advertisement posted in the dedicated ad channel.'
      }
    ]
  },

  // Marketplace Pricing (Separate from store ad catalog)
  marketplace: {
    options: [
      { id: 'mkt_no_ping', name: 'No Ping', priceRobux: 150, priceDisplay: 'R$150' },
      { id: 'mkt_here_ping', name: 'Here Ping', priceRobux: 350, priceDisplay: 'R$350' },
      { id: 'mkt_everyone_ping', name: 'Everyone Ping', priceRobux: 600, priceDisplay: 'R$600' },
      { id: 'mkt_own_channel', name: 'Your Own Channel (1 Month)', priceRobux: 800, priceDisplay: 'R$800', note: 'Includes Everyone ping. Channel removed after 1 month.' }
    ],
    addons: [
      { id: 'addon_priority', name: 'Priority Add-on', priceRobux: 400, priceDisplay: 'R$400' },
      { id: 'addon_giveaway', name: 'Sponsored Giveaway Add-on', priceRobux: 200, priceDisplay: 'R$200' }
    ]
  },

  // Design Price List (Standard Catalog)
  designPrices: [
    { service: 'Liveries', priceRange: 'R$90–130', description: 'Custom vehicle liveries for your roleplay server or department.' },
    { service: 'Clothing', priceRange: 'R$80 per piece', description: 'Custom Roblox shirts, pants, and other clothing designs.' },
    { service: 'Embeds', priceRange: 'R$10–30', description: 'Custom Discord embeds for announcements, information, rules, and more.' },
    { service: 'Stickers', priceRange: 'R$10–30', description: 'Custom stickers for your Discord server or community.' },
    { service: 'Logos', priceRange: 'R$10–30', description: 'Custom logos for groups, departments, businesses, and servers.' },
    { service: 'Pictures / PFPs', priceRange: 'R$10–30', description: 'Custom profile pictures, banners, and other graphics.' }
  ],

  // Expanded Service Pricing
  expandedPricing: {
    disclaimer: 'A 30% Roblox tax may apply to relevant transactions. Clearly distinguish listed prices from any estimated net amount.',
    categories: [
      {
        name: 'Graphics',
        description: 'Professional graphics designed to elevate branding through clean and impactful visuals.',
        items: [
          { name: 'Logo', price: 'R$400+' },
          { name: 'Banners', price: 'R$125+' },
          { name: 'Banner Bundle', price: 'R$1,250+' },
          { name: 'Server Bundle', price: 'R$1,750+' }
        ]
      },
      {
        name: 'Livery',
        description: 'Realistic and well-aligned vehicle liveries tailored to your department or concept.',
        items: [
          { name: 'LEO (Law Enforcement)', price: 'R$175+' },
          { name: 'FD (Fire / EMS)', price: 'R$200+' },
          { name: 'Other Services', price: 'R$150+' }
        ]
      },
      {
        name: 'Clothing',
        description: 'Custom, high-quality clothing designed with clean details and professional finishes.',
        items: [
          { name: 'Complete Set', price: 'R$125' },
          { name: 'Shirt Only', price: 'R$75' },
          { name: 'Pants Only', price: 'R$50' }
        ]
      },
      {
        name: 'Bot Development',
        description: 'Build a custom Discord bot with configurable modules. Final pricing varies by scope.',
        items: [
          { name: 'Custom Discord Bot', price: 'Custom Quote (Start Order)' },
          { name: 'First 30 Days Hosting', price: 'Free included with bot order' }
        ]
      }
    ]
  },

  // Bundles
  bundles: {
    bannerBundle: {
      name: 'Banner Bundle',
      startingPrice: 'R$1,250',
      description: 'The Banner Bundle price varies depending on specifications and detail requirements.',
      items: [
        '1x High-Resolution Server Banner',
        '10x Custom Embed Banners',
        '1x Matching Footer Banner'
      ]
    },
    serverBundle: {
      name: 'Discord Server Bundle',
      startingPrice: 'R$2,000',
      description: 'Turnkey setup for community or roleplay Discord servers. Bot setup supports up to 3 bots.',
      items: [
        'Complete Channel Architecture & Category Setup',
        'Complete Role Hierarchy Setup',
        'Role & Channel Permission Lockdowns',
        'Bot Configuration (up to 3 bots)'
      ]
    }
  },

  // Hosting Plans
  hosting: {
    note: 'The first 30 days after a new bot order is logged are free under the configured policy. Hosting is only available for bots ordered through the Silence Designs team.',
    plans: [
      { id: 'monthly', name: 'Monthly Plan (30 Days)', priceRobux: 250, priceUsd: '$2.25', durationDays: 30 },
      { id: 'quarterly', name: 'Quarterly Plan (90 Days / 3 Months)', priceRobux: 500, priceUsd: '$4.50', durationDays: 90 },
      { id: 'biannually', name: 'Bi-Annually Plan (180 Days / 6 Months)', priceRobux: 900, priceUsd: '$8.10', durationDays: 180 }
    ]
  }
};

export default products;
