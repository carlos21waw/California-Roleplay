import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getServiceStatus } from '../database/db.js';
import { createBaseEmbed } from '../embeds/embedBuilder.js';
import config from '../config/config.js';

export function buildServicesSelectMenu() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('services_detail_select')
    .setPlaceholder('Select a service for details & availability...')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Livery')
        .setDescription('Emergency response and custom vehicle liveries')
        .setValue('service_livery')
        .setEmoji('🚓'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Clothing')
        .setDescription('High-detail shirts, pants, and tactical uniforms')
        .setValue('service_clothing')
        .setEmoji('👕'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Graphics')
        .setDescription('Logos, embed banners, PFP aesthetics, and seals')
        .setValue('service_graphics')
        .setEmoji('🎨'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Bot Development')
        .setDescription('Custom Discord bots & hosted community solutions')
        .setValue('service_bot_dev')
        .setEmoji('🤖')
    );

  return new ActionRowBuilder().addComponents(select);
}

export async function handleServicesSelection(interaction) {
  const selected = interaction.values[0];

  const map = {
    service_livery: {
      name: 'Livery',
      title: '🚓 ER:LC Vehicle Liveries',
      pricing: '• LEO (Law Enforcement): R$175+\n• FD (Fire / EMS): R$200+\n• Other Services: R$150+',
      description: 'Realistic and well-aligned vehicle liveries tailored to your department or concept. Compatible with all Liberty County emergency vehicle models.'
    },
    service_clothing: {
      name: 'Clothing',
      title: '👕 Custom Roblox Clothing',
      pricing: '• Complete Set: R$125\n• Shirt Only: R$75\n• Pants Only: R$50',
      description: 'Custom, high-quality clothing designed with clean textures, shading, and professional tactical finishes.'
    },
    service_graphics: {
      name: 'Graphics',
      title: '🎨 Professional Community Graphics',
      pricing: '• Logo: R$400+\n• Banners: R$125+\n• Banner Bundle: R$1,250+\n• Server Bundle: R$1,750+',
      description: 'Professional graphics designed to elevate branding through clean and impactful visuals for Discord and Roblox groups.'
    },
    service_bot_dev: {
      name: 'Bot Development',
      title: '🤖 Custom Discord Bot Development',
      pricing: '• Custom Bot: Custom Scope Quote\n• First 30 Days Hosting: FREE included with bot order',
      description: 'Build a custom Discord bot with configurable modules. To receive an estimated price, start an order and complete the requested information.'
    }
  };

  const info = map[selected];
  if (!info) return interaction.reply({ content: 'Service not found.', ephemeral: true });

  const statusRecord = await getServiceStatus(info.name);
  const isOpen = statusRecord ? Boolean(statusRecord.is_open) : true;

  const statusText = isOpen
    ? '🟢 **CURRENTLY OPEN**\nWe are actively accepting requests for this service.'
    : '🔴 **CURRENTLY CLOSED**\nWe are not accepting new requests for this service at the moment due to capacity.';

  const embed = createBaseEmbed({
    title: info.title,
    description: `${info.description}\n\n**Status:**\n${statusText}\n\n**Pricing Overview:**\n${info.pricing}`,
    color: isOpen ? config.colors.success : config.colors.error,
    fields: [
      {
        name: 'Order Instructions',
        value: isOpen
          ? 'Use `/order-create` or open a Design Order ticket from our ticket panel to submit your specifications.'
          : 'Please wait until orders reopen or check back in a few days.'
      }
    ]
  });

  const buttons = new ActionRowBuilder();
  if (isOpen) {
    buttons.addComponents(
      new ButtonBuilder()
        .setCustomId('btn_open_order_ticket')
        .setLabel('Order This Service')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('✍️')
    );
  }

  await interaction.reply({
    embeds: [embed],
    components: isOpen ? [buttons] : [],
    ephemeral: true
  });
}

export default {
  buildServicesSelectMenu,
  handleServicesSelection
};
