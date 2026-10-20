import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createTicket } from '../database/db.js';
import { generateRefId, safeText } from '../utils/formatters.js';
import { createTicketWelcomeEmbed, createSuccessEmbed } from '../embeds/embedBuilder.js';
import config from '../config/config.js';

export function buildReportMemberModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_report_member')
    .setTitle('Silence Designs — Incident Report');

  const targetInput = new TextInputBuilder()
    .setCustomId('reported_user')
    .setLabel('Reported User (Tag, Username, or ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Offender#0001 or User Snowflake ID')
    .setRequired(true)
    .setMaxLength(100);

  const reasonInput = new TextInputBuilder()
    .setCustomId('report_reason')
    .setLabel('Infraction Classification')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Harassment, Asset Piracy, Scam, ToS Violation')
    .setRequired(true)
    .setMaxLength(150);

  const detailsInput = new TextInputBuilder()
    .setCustomId('report_details')
    .setLabel('Incident Narrative & Specifics')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Provide a factual, objective recount of the incident including timestamps and channel...')
    .setRequired(true)
    .setMaxLength(1000);

  const evidenceInput = new TextInputBuilder()
    .setCustomId('report_evidence')
    .setLabel('Links to Screenshots / Screen Recordings')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Imgur, Discord message links, Streamable, or state "Uploading in ticket channel"')
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
  const evidence = safeText(interaction.fields.getTextInputValue('report_evidence')) || 'Attached directly in channel.';

  const refId = generateRefId('REP');
  let channel = null;
  const parentCategory = config.channels.ticketsCategory || null;

  try {
    const channelName = `report-${refId.toLowerCase()}`;
    channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: parentCategory,
      topic: `Silence Designs Confidential Report ${refId} • Submitted by: ${interaction.user.tag}`,
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

  const inquirySummary = `**Reported Account:** \`${reportedUser}\`\n**Violation:** \`${reason}\`\n\n**Details:**\n${details}\n\n**Evidence:**\n${evidence}`;

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
      'Confidential Incident Report',
      inquirySummary
    );

    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_claim_${refId}`)
        .setLabel('Claim Investigation')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✋'),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${refId}`)
        .setLabel('Resolve & Archive')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔒')
    );

    await channel.send({
      content: `<@${interaction.user.id}> ✦ Your confidential report has been securely filed.`,
      embeds: [welcomeEmbed],
      components: [buttonsRow]
    });
  }

  const successEmbed = createSuccessEmbed(
    'Incident Report Filed Confidentially',
    `Your report regarding \`${reportedUser}\` has been logged under Reference ID \`${refId}\`.`,
    [
      { name: 'Reference ID', value: `\`${refId}\``, inline: true },
      { name: 'Investigation Channel', value: channel ? `<#${channel.id}>` : '*Logged to Staff*', inline: true },
      { name: 'Privacy Guarantee', value: 'The reported member has NOT been notified or pinged.', inline: false }
    ],
    channel
      ? `Please upload any raw screenshots or logs to <#${channel.id}>. Staff will investigate impartially.`
      : 'Moderators will audit the report.'
  );

  await interaction.editReply({ embeds: [successEmbed] });
}

export default {
  buildReportMemberModal,
  handleReportMemberSubmit
};
