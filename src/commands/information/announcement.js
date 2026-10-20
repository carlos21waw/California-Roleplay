import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import config from '../../config/config.js';

export const data = new SlashCommandBuilder()
  .setName('announcement')
  .setDescription('View the latest official Silence Designs announcement');

export async function execute(interaction) {
  const embed = createBaseEmbed({
    title: '📢 Silence Designs — Official Announcement',
    description: '**👻 Halloween Updates \'26 — Part 2**\n\n' +
      'Spooky season is officially halfway through, and we\'ve got another update to share with you all!\n\n' +
      '• **New ER:LC Ghost Livery Pack:** Check out the latest stealth additions in our releases channel.\n' +
      '• **Silence Designs+ Perks:** VIP members now enjoy priority queue placement and a 10% discount.\n' +
      '• **Designer Recruitment:** We are currently reviewing applications submitted via `/apply-designer`.\n\n' +
      'Thank you for your ongoing support as we continue delivering top-tier liveries for Liberty County communities!',
    color: 0x38BDF8,
    footerText: 'Silence Designs Announcements'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
