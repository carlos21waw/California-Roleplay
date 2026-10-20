import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-idea')
  .setDescription('Generate creative ER:LC livery or community design concepts using Gemini AI')
  .addStringOption(option =>
    option
      .setName('theme')
      .setDescription('The theme, department, or vibe (e.g. Desert Highway Patrol, Ghost Tactical, Metro SWAT)')
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!isAiConfigured()) {
    return interaction.reply({
      embeds: [createErrorEmbed('AI Not Configured', 'Google Gemini API is not configured on this bot. Please set `GEMINI_API_KEY` in `.env`.')],
      ephemeral: true
    });
  }

  await interaction.deferReply();
  const theme = interaction.options.getString('theme');

  try {
    const prompt = `Generate a detailed, innovative ER:LC livery and department concept for the theme: "${theme}". Include: 
1. Department Name & Type (e.g., County Sheriff, State Police, Metro)
2. Primary Vehicle Models (e.g. 2020 FPIU, Tahoe, Charger)
3. Livery Design Concept (stripes, chevron pattern, door seals, ghosting effect)
4. Recommended Color Palette (Hex codes & names)
5. Unique Feature (e.g. K9 unit variant, low-profile ghost markings). Keep it concise, punchy, and formatted with markdown.`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `💡 AI Design Concept — ${theme}`,
      description: result,
      color: 0x8B5CF6,
      footerText: 'Powered by Silence Designs AI • Run /order-create to bring it to life'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('AI Generation Error', err.message)]
    });
  }
}

export default { data, execute };
