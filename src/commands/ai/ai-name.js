import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-name')
  .setDescription('Generate authentic fictional county, city, department, or server names')
  .addStringOption(option =>
    option
      .setName('region_vibe')
      .setDescription('Geographic atmosphere (e.g. Pacific Northwest, Deep South, Coastal Metro, Rust Belt)')
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
  const vibe = interaction.options.getString('region_vibe');

  try {
    const prompt = `Generate 8 authentic-sounding fictional county, township, municipal, and emergency agency names for the regional vibe: "${vibe}".
For each entry, format cleanly:
• **[Jurisdiction Name]**
  - Police: [e.g. County Sheriff or Municipal PD]
  - Fire/EMS: [e.g. Fire & Rescue District #4]
  - Atmosphere: [1 short sentence setting the roleplay feel]`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `✦ Nomenclature Registry — ${vibe}`,
      description: result,
      color: 0x38BDF8,
      footerText: 'Silence Designs Agency Directory • Fictional Worldbuilding'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('Generation Error', err.message, 'ERR_GEMINI_FAIL')]
    });
  }
}

export default { data, execute };
