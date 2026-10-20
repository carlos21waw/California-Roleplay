import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed, createLoadingEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-palette')
  .setDescription('Generate a harmonious ER:LC livery & branding color palette with copyable Hex codes')
  .addStringOption(option =>
    option
      .setName('style')
      .setDescription('Design aesthetic (e.g. Midnight Tactical, Clean Highway Patrol, Desert Sheriff)')
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!isAiConfigured()) {
    return interaction.reply({
      embeds: [
        createErrorEmbed(
          'AI Service Offline',
          'Google Gemini API is currently unconfigured on this instance. The bot administrator must supply `GEMINI_API_KEY` in `.env`.',
          'ERR_AI_UNCONFIGURED',
          'All non-AI commands remain fully operational. Contact bot administrators to enable AI features.'
        )
      ],
      ephemeral: true
    });
  }

  await interaction.deferReply();

  const style = interaction.options.getString('style');

  try {
    const prompt = `Generate a masterclass 5-color aesthetic palette for the ER:LC / Discord community design style: "${style}".
Format the response cleanly with structured markdown.
For each color, provide:
1. Color Name
2. Hex Code (e.g. #0B1E36) in an inline code block for easy copying
3. Livery / Asset Usage (e.g. Primary Car Body, High-contrast Chevron stripe, Door Badge Outline, Text Decal, Secondary Accent)
4. Design Rationale (1 short sentence explaining why it works in Liberty County lighting).`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `✦ Color Palette Architecture — ${style}`,
      description: `Structured 5-color harmony tailored for ER:LC vehicle materials, vehicle wraps, and community branding.\n\n${result}`,
      color: 0x38BDF8,
      footerText: 'Silence Designs • AI Color Engine • Copy any hex code above'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          'Generation Error',
          err.message,
          'ERR_GEMINI_FAIL',
          'Try a slightly different theme phrase or re-run the command in a few moments.'
        )
      ]
    });
  }
}

export default { data, execute };
