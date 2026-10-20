import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-slogan')
  .setDescription('Generate punchy mottos, slogans, and door quarter-panel quotes for your liveries')
  .addStringOption(option =>
    option
      .setName('agency_type')
      .setDescription('Type of agency (e.g. State Police, Rural Fire, SWAT, Security, Towing)')
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
  const agency = interaction.options.getString('agency_type');

  try {
    const prompt = `Generate 8 diverse, memorable mottos and slogans suitable for vehicle livery quarter panels and department branding for: "${agency}". Include:
- 3 Traditional / Prestigious (e.g. "Integrity • Vigilance • Service")
- 3 Modern / Assertive (e.g. "Protecting Tomorrow, Today")
- 2 Latin / Classical with English translations.`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `🖋️ Slogans & Mottos — ${agency}`,
      description: result,
      color: 0xEAB308,
      footerText: 'Silence Designs AI Slogan Generator'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('AI Generation Error', err.message)]
    });
  }
}

export default { data, execute };
