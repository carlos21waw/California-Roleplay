import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import products from '../config/products.js';
import { createBaseEmbed } from '../embeds/embedBuilder.js';
import config from '../config/config.js';

export function buildStoreSelectMenu() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('store_catalog_select')
    .setPlaceholder('Browse Store Categories...')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Server Booster Perks')
        .setDescription('Perks and discounts for boosting the server')
        .setValue('store_boosters')
        .setEmoji('🚀'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Silence Designs+ Perks')
        .setDescription('Exclusive VIP rank, discounts, early access')
        .setValue('store_membership')
        .setEmoji('💎'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Donations')
        .setDescription('Support community development and earn donator roles')
        .setValue('store_donations')
        .setEmoji('💖'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Advertisements')
        .setDescription('Paid ping announcements & sponsored giveaways')
        .setValue('store_ads')
        .setEmoji('📢')
    );

  return new ActionRowBuilder().addComponents(select);
}

export async function handleStoreSelection(interaction) {
  const selected = interaction.values[0];

  if (selected === 'store_boosters') {
    const embed = createBaseEmbed({
      title: '🚀 Server Booster Perks',
      description: products.boosterPerks.description,
      color: config.colors.store,
      fields: [
        { name: 'Benefits Included', value: products.boosterPerks.benefits.map(b => `• ${b}`).join('\n') }
      ],
      footerText: 'Server Booster perks are automatically granted when you boost our Discord server.'
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (selected === 'store_membership') {
    const mem = products.membership;
    const embed = createBaseEmbed({
      title: '💎 Silence Designs+ Membership',
      description: mem.description,
      color: config.colors.accent,
      fields: [
        { name: 'Price', value: `\`${mem.priceDisplay}\``, inline: true },
        { name: 'Platform', value: 'Roblox Developer Product', inline: true },
        { name: 'Perks & Privileges', value: mem.benefits.map(b => `• ${b}`).join('\n') }
      ],
      footerText: 'After purchasing, open a Billing ticket or run /profile to verify your perks.'
    });

    const buyBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(`Purchase Silence Designs+ (${mem.priceDisplay})`)
        .setStyle(ButtonStyle.Link)
        .setURL(mem.url)
        .setEmoji('🛒')
    );

    return interaction.reply({ embeds: [embed], components: [buyBtn], ephemeral: true });
  }

  if (selected === 'store_donations') {
    const don = products.donations;
    const embed = createBaseEmbed({
      title: '💖 Community Donations',
      description: don.description,
      color: config.colors.primary,
      fields: [
        { name: 'Donator Benefits', value: don.benefits.map(b => `• ${b}`).join('\n') },
        {
          name: 'Donation Tiers',
          value: don.tiers.map(t => `• **${t.name}**: \`${t.priceDisplay}\``).join('\n')
        }
      ]
    });

    const buttons = new ActionRowBuilder().addComponents(
      don.tiers.map(t =>
        new ButtonBuilder()
          .setLabel(`${t.name} (${t.priceDisplay})`)
          .setStyle(ButtonStyle.Link)
          .setURL(t.url)
          .setEmoji('🎁')
      )
    );

    return interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
  }

  if (selected === 'store_ads') {
    const ads = products.storeAds;
    const embed = createBaseEmbed({
      title: '📢 Store Advertisements',
      description: ads.description,
      color: config.colors.primary,
      fields: ads.items.map(i => ({
        name: `${i.name} — ${i.priceDisplay}`,
        value: i.description
      }))
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Instant Postage (R$2,500)')
        .setStyle(ButtonStyle.Link)
        .setURL(ads.items[0].url),
      new ButtonBuilder()
        .setLabel('Bypass Queue (R$1,250)')
        .setStyle(ButtonStyle.Link)
        .setURL(ads.items[1].url),
      new ButtonBuilder()
        .setLabel('Everyone Ping (R$1,000)')
        .setStyle(ButtonStyle.Link)
        .setURL(ads.items[2].url),
      new ButtonBuilder()
        .setLabel('Here Ping (R$600)')
        .setStyle(ButtonStyle.Link)
        .setURL(ads.items[3].url),
      new ButtonBuilder()
        .setLabel('No Ping (R$300)')
        .setStyle(ButtonStyle.Link)
        .setURL(ads.items[4].url)
    );

    return interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
  }
}

export default {
  buildStoreSelectMenu,
  handleStoreSelection
};
