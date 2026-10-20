import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getOrder, incrementUserProfile } from '../../database/db.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import products from '../../config/products.js';

export const data = new SlashCommandBuilder()
  .setName('order-tip')
  .setDescription('Send a tip or direct creator support to your assigned designer')
  .addStringOption(option =>
    option.setName('order_id').setDescription('The Order ID').setRequired(true)
  );

export async function execute(interaction) {
  const orderId = interaction.options.getString('order_id').toUpperCase().trim();
  const order = await getOrder(orderId);

  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed('Commission Not Found', `Order \`${orderId}\` was not found.`, 'ERR_NOT_FOUND')],
      ephemeral: true
    });
  }

  await incrementUserProfile(interaction.user.id, 'tips_given', 1);

  const embed = createBaseEmbed({
    title: `✦ Designer Tip Portal — ${orderId}`,
    description: `Silence Designs artists dedicate significant time and craftsmanship to delivering realistic, authentic ER:LC liveries and assets.\n\n` +
      `**Assigned Artist:** ${order.designer_id ? `<@${order.designer_id}>` : 'Silence Designs Creative Division'}\n` +
      `**Commission:** \`${order.service_type}\` • ID: \`${order.id}\`\n\n` +
      `All tips directly support the creator and fund community templates:`,
    color: 0x38BDF8,
    fields: [
      { name: 'Small Tip', value: `\`R$200\` • [Purchase via Roblox](${products.donations.tiers[0].url})`, inline: true },
      { name: 'Medium Tip', value: `\`R$500\` • [Purchase via Roblox](${products.donations.tiers[1].url})`, inline: true },
      { name: 'Generous Tip', value: `\`R$1,000\` • [Purchase via Roblox](${products.donations.tiers[2].url})`, inline: true }
    ],
    footerText: 'Silence Designs • Creator Support Program'
  });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Tip R$200')
      .setStyle(ButtonStyle.Link)
      .setURL(products.donations.tiers[0].url)
      .setEmoji('☕'),
    new ButtonBuilder()
      .setLabel('Tip R$500')
      .setStyle(ButtonStyle.Link)
      .setURL(products.donations.tiers[1].url)
      .setEmoji('💎'),
    new ButtonBuilder()
      .setLabel('Tip R$1,000')
      .setStyle(ButtonStyle.Link)
      .setURL(products.donations.tiers[2].url)
      .setEmoji('👑')
  );

  await interaction.reply({ embeds: [embed], components: [buttons] });
}

export default { data, execute };
