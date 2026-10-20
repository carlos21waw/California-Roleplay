import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createTicket } from '../database/db.js';
import { generateRefId, safeText } from '../utils/formatters.js';
import { createTicketWelcomeEmbed } from '../embeds/embedBuilder.js';
import config from '../config/config.js';

export function buildReportMemberModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_report_member')
    .setTitle('Silence Designs — Report Member');

  const targetInput = new TextInputBuilder()
    .setCustomId('reported_user')
    .setLabel('Reported Member (Username, Tag, or ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. BadActor#0001 or 123456789012345678')
    .setRequired(true)
    .setMaxLength(100);

  const reasonInput = new TextInputBuilder()
    .setCustomId('report_reason')
    .setLabel('Violation Reason')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Mass ping, harassment, scam attempt, ban bypass')
    .setRequired(true)
    .setMaxLength(150);

  const detailsInput = new TextInputBuilder()
    .setCustomId('report_details')
    .setLabel('Relevant Details & Context')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Explain what happened and where...')
    .setRequired(true)
    .setMaxLength(1000);

  const evidenceInput = new TextInputBuilder()
    .setCustomId('report_evidence')
    .setLabel('Evidence Link(s) / Attachments')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Paste message links, imgur links, or attach files in the ticket channel')
    .setRequired(false)
    .setMaxLength(500);

  modal.addComponents(
    new ActionRowBuilder().addComponents(targetInput),
    new ActionRowBuilder().addComponents(reasonInput),
    new ActionRowBuilder().addComponents(detailsInput),
    new ActionRowBuilder().addComponents(evidenceInput)
  );

  return modal;
}

export async function handleReportMemberSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const reportedUser = safeText(interaction.fields.getTextInputValue('reported_user'));
  const reason = safeText(interaction.fields.getTextInputValue('report_reason'));
  const details = safeText(interaction.fields.getTextInputValue('report_details'));
  const evidence = safeText(interaction.fields.getTextInputValue('report_evidence')) || 'No external links provided (upload in channel).';

  const refId = generateRefId('REP');
  let channel = null;
  const parentCategory = config.channels.ticketsCategory || null;

  try {
    const channelName = `report-${refId.toLowerCase()}`;
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
    console.error('[ReportModal] Error creating channel:', err.message);
  }

  const inquirySummary = `**Reported User:** ${reportedUser}\n**Reason:** ${reason}\n\n**Details:**\n${details}\n\n**Evidence:**\n${evidence}`;

  await createTicket({
    id: refId,
    refId,
    channelId: channel ? channel.id : interaction.channelId,
    guildId: interaction.guildId,
    userId: interaction.user.id,
    userTag: interaction.user.tag,
    robloxUsername: 'N/A',
    category: 'Report a Member',
    inquiry: inquirySummary
  });

  if (channel) {
    const welcomeEmbed = createTicketWelcomeEmbed(
      interaction.user,
      refId,
      'Report a Member',
      inquirySummary
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
        .setEmoji('🔒')
    );

    await channel.send({
      content: `<@${interaction.user.id}> Your report has been submitted confidentially to staff.`,
      embeds: [welcomeEmbed],
      components: [buttonsRow]
    });
  }

  await interaction.editReply({
    content: `🚨 Report submitted under Reference ID **${refId}**. ${channel ? `View channel: <#${channel.id}>` : 'Staff will review it.'}`
  });
}

export default {
  buildReportMemberModal,
  handleReportMemberSubmit
};
