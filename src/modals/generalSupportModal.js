import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createTicket } from '../database/db.js';
import { generateRefId, safeText } from '../utils/formatters.js';
import { createTicketWelcomeEmbed } from '../embeds/embedBuilder.js';
import config from '../config/config.js';

export function buildGeneralSupportModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_general_support')
    .setTitle('Silence Designs — General Support');

  const robloxInput = new TextInputBuilder()
    .setCustomId('roblox_username')
    .setLabel('Roblox Username (Optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter your Roblox username if related')
    .setRequired(false)
    .setMaxLength(50);

  const issueInput = new TextInputBuilder()
    .setCustomId('issue_details')
    .setLabel('How can we help you today?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Explain your inquiry, question, or problem in detail...')
    .setRequired(true)
    .setMaxLength(1000);

  modal.addComponents(
    new ActionRowBuilder().addComponents(robloxInput),
    new ActionRowBuilder().addComponents(issueInput)
  );

  return modal;
}

export async function handleGeneralSupportSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const robloxUser = safeText(interaction.fields.getTextInputValue('roblox_username')) || 'Not Provided';
  const issue = safeText(interaction.fields.getTextInputValue('issue_details'));
  const refId = generateRefId('REF');

  let channel = null;
  const parentCategory = config.channels.ticketsCategory || null;

  try {
    const channelName = `ticket-${refId.toLowerCase()}`;
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
        }] : [])
      ]
    });
  } catch (err) {
    console.error('[SupportModal] Channel creation error:', err.message);
  }

  await createTicket({
    id: refId,
    refId,
    channelId: channel ? channel.id : interaction.channelId,
    guildId: interaction.guildId,
    userId: interaction.user.id,
    userTag: interaction.user.tag,
    robloxUsername: robloxUser,
    category: 'General Support',
    inquiry: issue
  });

  if (channel) {
    const welcomeEmbed = createTicketWelcomeEmbed(
      interaction.user,
      refId,
      'General Support',
      issue,
      robloxUser
    );

    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_claim_${refId}`)
        .setLabel('Claim Ticket')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✋'),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${refId}`)
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId(`ticket_report_${refId}`)
        .setLabel('Report')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🚨')
    );

    await channel.send({
      content: `<@${interaction.user.id}> Welcome to your support ticket!`,
      embeds: [welcomeEmbed],
      components: [buttonsRow]
    });
  }

  await interaction.editReply({
    content: `✅ Support ticket created! ${channel ? `Go to <#${channel.id}>` : 'Staff will assist you shortly.'}`
  });
}

export default {
  buildGeneralSupportModal,
  handleGeneralSupportSubmit
};
