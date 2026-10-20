import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createOrder, createTicket } from '../database/db.js';
import { generateRefId, safeText, formatDiscordTimestamp } from '../utils/formatters.js';
import { createOrderCard, createSuccessEmbed, createTicketWelcomeEmbed } from '../embeds/embedBuilder.js';
import config from '../config/config.js';

export function buildDesignOrderModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_design_order')
    .setTitle('Silence Designs — Design Commission');

  const robloxInput = new TextInputBuilder()
    .setCustomId('roblox_username')
    .setLabel('Roblox Account Username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Carlos473')
    .setRequired(true)
    .setMaxLength(50);

  const serviceInput = new TextInputBuilder()
    .setCustomId('service_type')
    .setLabel('Commission Service Type')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Livery / Clothing / Embeds / Graphics / Bot / Server Setup')
    .setRequired(true)
    .setMaxLength(50);

  const descInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Project Specifications & Brief')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Detail the vehicle models, department concept, realism requirements, and references...')
    .setRequired(true)
    .setMaxLength(1000);

  const colorsInput = new TextInputBuilder()
    .setCustomId('colors')
    .setLabel('Preferred Color Palette / Hex Codes')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. #0B1E36 Deep Navy, Matte White, Ghost Gray')
    .setRequired(false)
    .setMaxLength(100);

  const textInput = new TextInputBuilder()
    .setCustomId('requested_text')
    .setLabel('Markings, Unit Numbers & Slogans')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. "LIBERTY POLICE", Unit 204, Supervisor Ghost')
    .setRequired(false)
    .setMaxLength(150);

  modal.addComponents(
    new ActionRowBuilder().addComponents(robloxInput),
    new ActionRowBuilder().addComponents(serviceInput),
    new ActionRowBuilder().addComponents(descInput),
    new ActionRowBuilder().addComponents(colorsInput),
    new ActionRowBuilder().addComponents(textInput)
  );

  return modal;
}

export async function handleDesignOrderSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const robloxUser = safeText(interaction.fields.getTextInputValue('roblox_username'));
  const service = safeText(interaction.fields.getTextInputValue('service_type'));
  const desc = safeText(interaction.fields.getTextInputValue('description'));
  const colors = safeText(interaction.fields.getTextInputValue('colors')) || 'Standard Palette';
  const textReq = safeText(interaction.fields.getTextInputValue('requested_text')) || 'Standard Markings';

  const orderId = generateRefId('ORD');
  const refId = generateRefId('REF');

  // Save order to SQLite
  const newOrder = await createOrder({
    id: orderId,
    userId: interaction.user.id,
    userTag: interaction.user.tag,
    robloxUsername: robloxUser,
    serviceType: service,
    description: desc,
    preferredColors: colors,
    requestedText: textReq,
    status: 'Pending',
    createdAt: Date.now()
  });

  // Create private ticket channel in the guild
  let channel = null;
  const parentCategory = config.channels.ticketsCategory || null;

  try {
    const channelName = `order-${orderId.toLowerCase()}`;
    channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: parentCategory,
      topic: `Silence Designs Order ${orderId} • Client: ${interaction.user.tag}`,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        ...(config.roles.staff ? [{
          id: config.roles.staff,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
        }] : []),
        ...(config.roles.designer ? [{
          id: config.roles.designer,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
        }] : [])
      ]
    });
  } catch (err) {
    console.error('[DesignOrder] Failed to create channel:', err.message);
  }

  // Save ticket record
  await createTicket({
    id: orderId,
    refId,
    channelId: channel ? channel.id : interaction.channelId,
    guildId: interaction.guildId,
    userId: interaction.user.id,
    userTag: interaction.user.tag,
    robloxUsername: robloxUser,
    category: `Design Order — ${service}`,
    inquiry: `${desc}\n\n• Palette: ${colors}\n• Markings: ${textReq}`
  });

  if (channel) {
    const orderCard = createOrderCard(newOrder);
    const welcomeEmbed = createTicketWelcomeEmbed(
      interaction.user,
      refId,
      `Design Order (${service})`,
      `${desc}\n\n• **Order ID:** \`${orderId}\`\n• **Palette:** ${colors}\n• **Markings:** ${textReq}`,
      robloxUser
    );

    const controls = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_claim_${refId}`)
        .setLabel('Claim Order')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✋'),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${refId}`)
        .setLabel('Close Order Channel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId(`ticket_report_${refId}`)
        .setLabel('Report Issue')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🚨')
    );

    await channel.send({
      content: `<@${interaction.user.id}> ✦ Welcome to your private Silence Designs commission channel!`,
      embeds: [orderCard, welcomeEmbed],
      components: [controls]
    });
  }

  const successEmbed = createSuccessEmbed(
    'Commission Successfully Registered',
    `Your commission request **${orderId}** has been recorded into our persistent database.`,
    [
      { name: 'Commission ID', value: `\`${orderId}\``, inline: true },
      { name: 'Service', value: `\`${service}\``, inline: true },
      { name: 'Channel', value: channel ? `<#${channel.id}>` : '*Pending Staff Setup*', inline: true }
    ],
    channel
      ? `Please head over to <#${channel.id}> to upload reference livery images, discuss pricing with our designers, and track production.`
      : 'Our staff will review your specifications shortly.'
  );

  await interaction.editReply({ embeds: [successEmbed] });
}

export default {
  buildDesignOrderModal,
  handleDesignOrderSubmit
};
