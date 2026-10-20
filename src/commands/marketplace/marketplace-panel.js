import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import products from '../../config/products.js';
import rules from '../../config/rules.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { savePersistentPanel } from '../../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('marketplace-panel')
  .setDescription('Publish the official interactive Silence Designs Marketplace Panel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({ content: '❌ Only Management can publish the marketplace panel.', ephemeral: true });
  }

  const fields = products.marketplace.options.map(o => ({
    name: `${o.name} — ${o.priceDisplay}`,
    value: o.note || 'Standard marketplace postage option.',
    inline: false
  }));

  fields.push({
    name: '⭐ Marketplace Add-ons',
    value: products.marketplace.addons.map(a => `• **${a.name}:** \`${a.priceDisplay}\``).join('\n'),
    inline: false
  });

  fields.push({
    name: '📜 Marketplace Rules',
    value: rules.paidAdvertisements.slice(0, 4).map(r => `• ${r}`).join('\n'),
    inline: false
  });

  const embed = createBaseEmbed({
    title: '🛒 SILENCE DESIGNS — MARKETPLACE',
    description: 'Promote your community, roleplay server, or creative brand directly to our engaged audience.\n\n' +
      '*Note: "Your Own Channel" includes an Everyone ping. The channel is automatically cleaned up and removed after 1 month.*',
    color: 0x38BDF8,
    fields,
    footerText: 'Silence Designs Marketplace • To purchase, open a ticket'
  });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_open_order_ticket')
      .setLabel('Purchase Marketplace Advertisement')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📢'),
    new ButtonBuilder()
      .setLabel('View Rulebook')
      .setStyle(ButtonStyle.Link)
      .setURL(products.membership.url)
      .setEmoji('📜')
  );

  const sent = await interaction.channel.send({ embeds: [embed], components: [buttons] });
  await savePersistentPanel('marketplace', interaction.guildId, interaction.channelId, sent.id);

  await interaction.reply({ content: '✅ Marketplace panel published and saved persistently!', ephemeral: true });
}

export default { data, execute };
