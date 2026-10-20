import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { createGiveaway } from '../../database/db.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { isStaff } from '../../permissions/checkPermissions.js';
import { generateRefId } from '../../utils/formatters.js';

export const data = new SlashCommandBuilder()
  .setName('giveaway-create')
  .setDescription('Create a persistent Silence Designs giveaway with verified entry tracking')
  .addStringOption(option => option.setName('prize').setDescription('Giveaway prize (e.g. 1 Month Discord Nitro, R$1,000)').setRequired(true))
  .addStringOption(option => option.setName('title').setDescription('Giveaway title').setRequired(true))
  .addIntegerOption(option => option.setName('duration_minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1))
  .addIntegerOption(option => option.setName('winners').setDescription('Number of winners').setRequired(false).setMinValue(1).setMaxValue(20))
  .addStringOption(option => option.setName('sponsor').setDescription('Sponsor name (defaults to Silence Designs)').setRequired(false))
  .addStringOption(option => option.setName('server_name').setDescription('Server name').setRequired(false))
  .addStringOption(option => option.setName('server_invite').setDescription('Discord invite URL').setRequired(false))
  .addStringOption(option => option.setName('description').setDescription('Giveaway description details').setRequired(false))
  .addStringOption(option => option.setName('image_url').setDescription('Image URL banner').setRequired(false))
  .addRoleOption(option => option.setName('ping_role').setDescription('Role to ping').setRequired(false))
  .addChannelOption(option => option.setName('channel').setDescription('Destination channel').addChannelTypes(ChannelType.GuildText).setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Only authorized staff members can create giveaways.', ephemeral: true });
  }

  const prize = interaction.options.getString('prize');
  const title = interaction.options.getString('title');
  const durationMins = interaction.options.getInteger('duration_minutes');
  const winnerCount = interaction.options.getInteger('winners') || 1;
  const sponsor = interaction.options.getString('sponsor') || 'Silence Designs';
  const serverName = interaction.options.getString('server_name') || interaction.guild.name;
  const serverInvite = interaction.options.getString('server_invite');
  const desc = interaction.options.getString('description') || '';
  const imageUrl = interaction.options.getString('image_url');
  const pingRole = interaction.options.getRole('ping_role');
  const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

  const endTime = Date.now() + (durationMins * 60 * 1000);
  const endTimestamp = Math.floor(endTime / 1000);
  const giveawayId = generateRefId('GW');

  const disclaimer = sponsor.toLowerCase().includes('silence')
    ? ''
    : '\n\n*This giveaway is independently hosted and sponsored by the named sponsor. It is not sponsored by or affiliated with Silence Designs unless explicitly stated.*';

  const embed = createBaseEmbed({
    title: `🎁 ${title} — Giveaway in ${serverName}`,
    description: `${desc ? `${desc}\n\n` : ''}` +
      `**Prize:** \`${prize}\`\n` +
      `**Winners:** **${winnerCount}**\n` +
      `**Ends:** <t:${endTimestamp}:R> (<t:${endTimestamp}:f>)\n` +
      `**Sponsored By:** **${sponsor}**\n` +
      `• **Entries:** 0` +
      (serverInvite ? `\n• **Join Server:** [Click Here](${serverInvite})` : '') +
      disclaimer,
    color: 0xEC4899,
    thumbnail: imageUrl || undefined,
    footerText: `Giveaway ID: ${giveawayId} • Click Join Giveaway to enter`
  });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('gw_join_btn')
      .setLabel('Join Giveaway')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🎉'),
    new ButtonBuilder()
      .setCustomId('gw_participants_btn')
      .setLabel('View Participants')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('👥')
  );

  const pingContent = pingRole ? `<@&${pingRole.id}> 🎉 **NEW GIVEAWAY!**` : null;

  const sentMessage = await targetChannel.send({
    content: pingContent,
    embeds: [embed],
    components: [buttons]
  });

  await createGiveaway({
    id: giveawayId,
    messageId: sentMessage.id,
    channelId: targetChannel.id,
    guildId: interaction.guildId,
    prize,
    title,
    description: desc,
    sponsor,
    serverName,
    serverInvite,
    imageUrl,
    winnerCount,
    endTime,
    pingRole: pingRole ? pingRole.id : null
  });

  await interaction.reply({
    content: `✅ Giveaway **${giveawayId}** created successfully in <#${targetChannel.id}>!`,
    ephemeral: true
  });
}

export default { data, execute };
