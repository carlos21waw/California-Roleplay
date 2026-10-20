import { SlashCommandBuilder } from 'discord.js';
import config from '../../config/config.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('credits')
  .setDescription('View the official creator and development credits for Silence Designs');

export async function execute(interaction) {
  const embed = createBaseEmbed({
    title: '💎 Silence Designs — Project & Development Credits',
    description: 'Silence Designs is a dedicated Discord bot engineered for ER:LC livery craftsmanship, order tracking, and community operations.',
    color: 0x38BDF8,
    fields: [
      {
        name: 'Lead Creator & Software Engineer',
        value: `👤 **Carlos473**\n• Discord ID: \`${config.developerId}\`\n• Account: <@${config.developerId}>`,
        inline: false
      },
      {
        name: 'Design Team & Community Staff',
        value: '• **Silence Designs Executive Team**\n• **Silence Designs Creative Livery Division**\n• **Silence Designs Discord Staff**',
        inline: false
      },
      {
        name: 'Technology Stack',
        value: '• Node.js & discord.js v14\n• SQLite Local Persistent Storage\n• Google Gemini AI SDK\n• Roblox Official Web APIs',
        inline: false
      },
      {
        name: 'Master Service Agreement',
        value: `[View Official Master Service Agreement](${config.masterServiceAgreementUrl})`,
        inline: false
      }
    ],
    footerText: 'SILENCE DESIGNS — Your vision. Our design.'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
