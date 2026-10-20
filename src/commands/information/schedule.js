import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('View upcoming community events, release drops, and application waves');

export async function execute(interaction) {
  const embed = createBaseEmbed({
    title: '📅 Silence Designs Event & Operation Schedule',
    description: 'Stay updated on our weekly design turnaround windows, giveaway drops, and hiring timelines.',
    color: 0x38BDF8,
    fields: [
      {
        name: '🕒 Order Processing & Support Hours',
        value: '• Monday – Friday: `10:00 AM – 11:00 PM EST`\n• Saturday – Sunday: `12:00 PM – 10:00 PM EST`\n*Ticket response SLA: within 24 hours.*'
      },
      {
        name: '🚀 Free & VIP Release Drops',
        value: '• Bi-Weekly Friday Drops at `6:00 PM EST`\n• Silence Designs+ members receive 15-minute early access!'
      },
      {
        name: '🎉 Sponsored Giveaway Cycles',
        value: '• Daily and weekend community giveaway draws\n• Check `/giveaways` or announcements for current active prizes.'
      },
      {
        name: '📋 Hiring & Application Waves',
        value: '• Designer Applications: Open periodically via `/apply-designer`\n• Community Staff: Open during server milestone expansions.'
      }
    ],
    footerText: 'Silence Designs Operational Calendar'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
