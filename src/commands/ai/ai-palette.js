import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-palette')
  .setDescription('Generate an aesthetically harmonized color palette with Hex codes for your livery or server')
  .addStringOption(option =>
    option
      .setName('style')
      .setDescription('Style or mood (e.g. Midnight Cyberpunk, Classic Tactical Sheriff, Clean Modern Fire)')
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
  const style = interaction.options.getString('style');

  try {
    const prompt = `Generate an exceptional 5-color aesthetic palette for the design style: "${style}". For each color:
- Color Name
- Hex Code (e.g. #1E293B)
- Design Usage (Base car body, primary stripe, accent pinstripe, badge outline, emergency text).
Format clearly with bullet points.`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `🎨 AI Color Palette — ${style}`,
      description: result,
      color: 0x38BDF8,
      footerText: 'Silence Designs AI Color Engine • Perfect for livery templates'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('AI Generation Error', err.message)]
    });
  }
}

export default { data, execute };
