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
  const agency = interaction.options.getString('agency_type');

  try {
    const prompt = `Generate 8 distinctive, memorable slogans and quarter-panel mottos for: "${agency}".
Group them into:
### Traditional & Prestigious
(3 formal, established law enforcement / emergency services mottos)

### Modern & High-Impact
(3 sleek, tactical, assertive mottos)

### Classical / Latin with Translations
(2 historical mottos with English translations)

Format each motto in inline code blocks or quotes for easy copy-pasting onto livery decal templates.`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `✦ Quarter-Panel Mottos — ${agency}`,
      description: result,
      color: 0xCBD5E1,
      footerText: 'Silence Designs Typography Engine • Ready for decal placement'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('Generation Error', err.message, 'ERR_GEMINI_FAIL')]
    });
  }
}

export default { data, execute };
