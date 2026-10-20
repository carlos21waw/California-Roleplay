import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import config from '../../config/config.js';

export const data = new SlashCommandBuilder()
  .setName('release')
  .setDescription('Publish an official Silence Designs design or asset release with files')
  .addStringOption(option => option.setName('title').setDescription('Release title (e.g. Chicago Police FPIU 2020)').setRequired(true))
  .addStringOption(option => option.setName('included_items').setDescription('Included items (e.g. 2020 FPIU Livery, window template, lore variant)').setRequired(true))
  .addStringOption(option => option.setName('credits').setDescription('Designer credits').setRequired(true))
  .addAttachmentOption(option => option.setName('preview_image').setDescription('Preview image/screenshot of the livery/asset').setRequired(true))
  .addAttachmentOption(option => option.setName('release_file').setDescription('The downloadable ZIP/file (respects 25MB limit)').setRequired(false))
  .addStringOption(option => option.setName('download_link').setDescription('External download link (if file exceeds limit or Google Drive)').setRequired(false))
  .addStringOption(option => option.setName('description').setDescription('Release description notes').setRequired(false))
  .addRoleOption(option => option.setName('ping_role').setDescription('Role to ping (defaults to configured Releases role)').setRequired(false))
  .addChannelOption(option => option.setName('channel').setDescription('Destination channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only authorized staff members can publish releases.')],
      ephemeral: true
    });
  }

  const title = interaction.options.getString('title');
  const items = interaction.options.getString('included_items');
  const credits = interaction.options.getString('credits');
  const previewImg = interaction.options.getAttachment('preview_image');
  const releaseFile = interaction.options.getAttachment('release_file');
  const downloadLink = interaction.options.getString('download_link');
  const desc = interaction.options.getString('description') ||
    'This resource is completely free for everyone! You are welcome to use it, customize the files to fit your needs, and utilize it across your own projects. Enjoy!';
  const pingRole = interaction.options.getRole('ping_role') || (config.roles.releasesPing ? { id: config.roles.releasesPing } : null);
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

  if (!releaseFile && !downloadLink) {
    return interaction.reply({
      embeds: [createErrorEmbed('Missing File', 'You must provide either an attached `release_file` or a valid `download_link`.')],
      ephemeral: true
    });
  }

  const embed = createBaseEmbed({
    title: `✈️ Free Release — ${title}`,
    description: `${desc}\n\n` +
      `**Included Item(s):**\n• ${items.split(',').map(i => i.trim()).join('\n• ')}\n\n` +
      `**Credits:** ${credits}\n` +
      (downloadLink ? `**Download Link:** [Click to Download Files](${downloadLink})\n` : '') +
      `**Ping:** ${pingRole ? `<@&${pingRole.id}>` : '@Releases'}`,
    color: 0x38BDF8,
    image: previewImg.url,
    footerText: 'SILENCE DESIGNS — Community Release'
  });

  const filesToSend = [];
  if (releaseFile) {
    filesToSend.push(releaseFile);
  }

  const pingText = pingRole ? `<@&${pingRole.id}> 🚨 **NEW SILENCE DESIGNS RELEASE!**` : null;

  await targetChannel.send({
    content: pingText,
    embeds: [embed],
    files: filesToSend
  });

  await interaction.reply({
    content: `✅ Release **${title}** published successfully in <#${targetChannel.id}>!`,
    ephemeral: true
  });
}

export default { data, execute };
