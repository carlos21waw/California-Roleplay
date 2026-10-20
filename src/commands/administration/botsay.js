import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('botsay')
  .setDescription('Publish custom branded announcements, updates, and releases as the bot')
  .addStringOption(option => option.setName('title').setDescription('Embed title').setRequired(true))
  .addStringOption(option => option.setName('description').setDescription('Main message content/description').setRequired(true))
  .addChannelOption(option => option.setName('channel').setDescription('Destination channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .addStringOption(option => option.setName('color').setDescription('Hex color code (e.g. #38BDF8)').setRequired(false))
  .addRoleOption(option => option.setName('ping_role').setDescription('Role to mention').setRequired(false))
  .addAttachmentOption(option => option.setName('image').setDescription('Main image attachment').setRequired(false))
  .addAttachmentOption(option => option.setName('thumbnail').setDescription('Thumbnail image attachment').setRequired(false))
  .addStringOption(option => option.setName('footer').setDescription('Custom footer text').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only Management or Executive members can use `/botsay`.')],
      ephemeral: true
    });
  }

  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description');
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
  const colorStr = interaction.options.getString('color');
  const pingRole = interaction.options.getRole('ping_role');
  const image = interaction.options.getAttachment('image');
  const thumbnail = interaction.options.getAttachment('thumbnail');
  const footerText = interaction.options.getString('footer');

  let color = 0x181B22;
  if (colorStr) {
    const cleanHex = colorStr.replace('#', '');
    const parsed = parseInt(cleanHex, 16);
    if (!isNaN(parsed)) color = parsed;
  }

  const embed = createBaseEmbed({
    title,
    description: description.replace(/\\n/g, '\n'),
    color,
    image: image ? image.url : undefined,
    thumbnail: thumbnail ? thumbnail.url : undefined,
    footerText: footerText || 'Silence Designs • Official Announcement'
  });

  const content = pingRole ? `<@&${pingRole.id}>` : null;

  await targetChannel.send({
    content,
    embeds: [embed]
  });

  await interaction.reply({
    content: `✅ Branded message posted successfully to <#${targetChannel.id}>!`,
    ephemeral: true
  });
}

export default { data, execute };
