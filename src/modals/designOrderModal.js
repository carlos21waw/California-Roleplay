import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { createOrder, createTicket } from '../database/db.js';
import { generateRefId, safeText } from '../utils/formatters.js';
import { createBaseEmbed, createTicketWelcomeEmbed } from '../embeds/embedBuilder.js';
import { getAssetAttachment } from '../utils/assetResolver.js';
import config from '../config/config.js';

export function buildDesignOrderModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_design_order')
    .setTitle('Silence Designs — Design Order');

  const robloxInput = new TextInputBuilder()
    .setCustomId('roblox_username')
    .setLabel('Roblox Username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Carlos473')
    .setRequired(true)
    .setMaxLength(50);

  const serviceInput = new TextInputBuilder()
    .setCustomId('service_type')
    .setLabel('Service Type')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Livery / Clothing / Embeds / Graphics / Bot')
    .setRequired(true)
    .setMaxLength(50);

  const descInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Design Description')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Describe your department, vehicle model, style, or specifications...')
    .setRequired(true)
    .setMaxLength(1000);

  const colorsInput = new TextInputBuilder()
    .setCustomId('colors')
    .setLabel('Preferred Colors')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Navy Blue, Ghost Gray, Gold Accents')
    .setRequired(false)
    .setMaxLength(100);

  const textInput = new TextInputBuilder()
    .setCustomId('requested_text')
    .setLabel('Text to Include')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. "LIBERTY POLICE", unit numbers, badges')
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
  const colors = safeText(interaction.fields.getTextInputValue('colors')) || 'None specified';
  const textReq = safeText(interaction.fields.getTextInputValue('requested_text')) || 'None specified';

  const orderId = generateRefId('ORD');
  const refId = generateRefId('REF');

  // Save order to DB
  await createOrder({
    id: orderId,
    userId: interaction.user.id,
    userTag: interaction.user.tag,
    robloxUsername: robloxUser,
    serviceType: service,
    description: desc,
    preferredColors: colors,
    requestedText: textReq
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
    inquiry: `${desc}\n\n• Colors: ${colors}\n• Text: ${textReq}`
  });

  if (channel) {
    const welcomeEmbed = createTicketWelcomeEmbed(
      interaction.user,
      refId,
      `Design Order (${service})`,
      `${desc}\n\n**Order ID:** \`${orderId}\`\n**Colors:** ${colors}\n**Text:** ${textReq}`,
      robloxUser
    );

    await channel.send({
      content: `<@${interaction.user.id}> Welcome to your private order channel!`,
      embeds: [welcomeEmbed]
    });
  }

  await interaction.editReply({
    content: `✅ Your order **${orderId}** has been recorded! ${channel ? `Head over to <#${channel.id}> to speak with our design team.` : 'Staff will review it shortly.'}`
  });
}

export default {
  buildDesignOrderModal,
  handleDesignOrderSubmit
};
