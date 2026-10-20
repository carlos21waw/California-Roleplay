import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-lore')
  .setDescription('Generate immersive roleplay department lore, history, and founding backstory')
  .addStringOption(option =>
    option
      .setName('department_name')
      .setDescription('Agency or jurisdiction name (e.g. Blackwood County Sheriff, North River Police)')
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!isAiConfigured()) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'AI Service Offline',
          'Google Gemini API is not configured on this instance. Please set `GEMINI_API_KEY` in `.env`.',
          'ERR_AI_UNCONFIGURED'
        )
      ],
      ephemeral: true
    });
  }

  await interaction.deferReply();
  const dept = interaction.options.getString('department_name');

  try {
    const prompt = `Write a compelling, realistic roleplay backstory and operational profile for: "${dept}".
Include:
### 1. Founding Heritage & Geography
- Origin year, regional jurisdiction, historic precinct roots

### 2. Operational Divisions & Structure
- Patrol Bureau, Traffic Intercept, Tactical Response, Air/Marine Operations

### 3. Department Motto & Core Doctrine
- 1 Latin or English motto, service philosophy in Liberty County roleplay.
Format with clean markdown headers and bullet points.`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `✦ Department Archive — ${dept}`,
      description: result,
      color: 0x16181D,
      footerText: 'Silence Designs Lore Architect • Authentic Roleplay Profiles'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('Generation Error', err.message, 'ERR_GEMINI_FAIL')]
    });
  }
}

export default { data, execute };
