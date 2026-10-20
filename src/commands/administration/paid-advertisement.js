import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { safeText } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('paid-advertisement')
  .setDescription('Publish an approved and payment-verified paid advertisement or sponsored announcement')
  .addStringOption(option => option.setName('title').setDescription('Advertisement headline/title').setRequired(true))
  .addStringOption(option => option.setName('server_name').setDescription('Name of the advertised server').setRequired(true))
  .addStringOption(option => option.setName('invite_url').setDescription('Discord invite URL').setRequired(true))
  .addStringOption(option =>
    option
      .setName('ping_type')
      .setDescription('Approved ping option')
      .setRequired(true)
      .addChoices(
        { name: 'No Ping', value: 'none' },
        { name: 'Here Ping (@here)', value: 'here' },
        { name: 'Everyone Ping (@everyone)', value: 'everyone' }
      )
  )
  .addStringOption(option => option.setName('sponsor').setDescription('Sponsor / Buyer username').setRequired(true))
  .addStringOption(option => option.setName('description').setDescription('Full advertisement text/promotional body').setRequired(true))
  .addAttachmentOption(option => option.setName('banner_image').setDescription('Optional advertisement promotional banner').setRequired(false))
  .addChannelOption(option => option.setName('channel').setDescription('Destination advertising channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only Management can publish paid advertisements.')],
      ephemeral: true
    });
  }

  const title = safeText(interaction.options.getString('title'));
  const serverName = safeText(interaction.options.getString('server_name'));
  const inviteUrl = interaction.options.getString('invite_url');
  const pingType = interaction.options.getString('ping_type');
  const sponsor = safeText(interaction.options.getString('sponsor'));
  const desc = safeText(interaction.options.getString('description'));
  const banner = interaction.options.getAttachment('banner_image');
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

  const disclaimer = '⚠️ **Disclaimer:** This is a paid advertisement. This server is not affiliated with Silence Designs.';

  const embed = createBaseEmbed({
    title: `📢 ${title} — ${serverName}`,
    description: `${desc}\n\n` +
      `**Server Invite:** [Click Here to Join](${inviteUrl})\n` +
      `**Sponsor:** \`${sponsor}\`\n` +
      `**Payment Status:** \`Verified by Management\`\n` +
      `**Publication Date:** <t:${Math.floor(Date.now() / 1000)}:f>\n\n` +
      disclaimer,
    color: 0xF59E0B,
    image: banner ? banner.url : undefined,
    footerText: 'Silence Designs Verified Paid Advertisement'
  });

  let pingContent = null;
  if (pingType === 'here') pingContent = '@here';
  if (pingType === 'everyone') pingContent = '@everyone';

  await targetChannel.send({
    content: pingContent,
    embeds: [embed]
  });

  await interaction.reply({
    content: `✅ Paid advertisement for **${serverName}** published in <#${targetChannel.id}> with **${pingType}** ping!`,
    ephemeral: true
  });
}

export default { data, execute };
