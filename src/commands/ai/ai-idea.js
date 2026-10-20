import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-idea')
  .setDescription('Generate an innovative ER:LC livery or community agency concept using Gemini AI')
  .addStringOption(option =>
    option
      .setName('theme')
      .setDescription('Design concept theme (e.g. Desert Highway Patrol, Ghost Tactical, Metro SWAT)')
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!isAiConfigured()) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'AI Service Offline',
          'Google Gemini API is not configured on this bot instance. Please set `GEMINI_API_KEY` in `.env`.',
          'ERR_AI_UNCONFIGURED',
          'Non-AI bot functions remain 100% active.'
        )
      ],
      ephemeral: true
    });
  }

  await interaction.deferReply();
  const theme = interaction.options.getString('theme');

  try {
    const prompt = `Act as lead creative director for Silence Designs. Generate an innovative, realistic ER:LC livery and agency concept based on: "${theme}".
Structure the response with markdown sections:
### 1. Agency Identity & Vehicle Fleet
- Recommended Vehicle Base (e.g. 2020 FPIU, 2021 Tahoe, Charger)
- Unit Division Roles (Patrol, Interceptor, K-9, Ghost Unit)

### 2. Livery Geometry & Graphic Elements
- Stripe layout, chevron angles, door badge placement, reflective accents

### 3. Tactical Material & Finish
- Recommended finish (Matte, Gloss, Metallic) and color contrast details

### 4. Livery Markings & Typography
- Font style, door seals, slogan suggestion.
Keep it punchy, professional, and visually engaging.`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `✦ Livery Concept Blueprint — ${theme}`,
      description: result,
      color: 0x38BDF8,
      footerText: 'Silence Designs AI Concept Studio • Ready to create? Type /order-create'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          'AI Generation Failed',
          err.message,
          'ERR_GEMINI_FAIL',
          'Please verify your prompt or try again shortly.'
        )
      ]
    });
  }
}

export default { data, execute };
