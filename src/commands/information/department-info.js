import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getRobloxGroupInfo } from '../../services/robloxService.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('department-info')
  .setDescription('Display official Roblox community group information, owner, and stats');

export async function execute(interaction) {
  await interaction.deferReply();
  const group = await getRobloxGroupInfo();

  const embed = createBaseEmbed({
    title: `🏛️ Roblox Group Information — ${group.name}`,
    description: group.description,
    color: 0x38BDF8,
    fields: [
      { name: 'Group ID', value: `\`${group.id}\``, inline: true },
      { name: 'Member Count', value: `👥 **${group.memberCount.toLocaleString()}** members`, inline: true },
      { name: 'Created Date', value: `📅 ${group.created}`, inline: true },
      {
        name: 'Group Owner',
        value: `👤 [${group.owner.username}](${group.owner.profileUrl}) (\`${group.owner.id}\`)`,
        inline: true
      },
      { name: 'Status', value: group.isLive ? '🟢 Live API Verified' : 'ℹ️ Cached Reference Data', inline: true }
    ],
    footerText: 'Silence Designs Community Partner'
  });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Join Roblox Community')
      .setStyle(ButtonStyle.Link)
      .setURL(group.groupUrl)
      .setEmoji('🌐'),
    new ButtonBuilder()
      .setLabel('Owner Profile')
      .setStyle(ButtonStyle.Link)
      .setURL(group.owner.profileUrl)
      .setEmoji('👤')
  );

  await interaction.editReply({ embeds: [embed], components: [buttons] });
}

export default { data, execute };
