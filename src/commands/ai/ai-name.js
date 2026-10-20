import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-name')
  .setDescription('Generate realistic city, county, department, or server names for your community')
  .addStringOption(option =>
    option
      .setName('region_vibe')
      .setDescription('Region or geographic vibe (e.g. Pacific Northwest, Deep South, Coastal Metropolitan)')
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
  const vibe = interaction.options.getString('region_vibe');

  try {
    const prompt = `Generate 10 authentic-sounding fictional county, township, municipal, and department names matching the regional vibe: "${vibe}". For each:
- County / City Name
- Corresponding Police Agency Name
- Corresponding Fire / Rescue Agency Name
- Quick 1-sentence regional atmosphere.`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `🏷️ Community & Agency Names — ${vibe}`,
      description: result,
      color: 0x06B6D4,
      footerText: 'Silence Designs AI Naming Studio'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('AI Generation Error', err.message)]
    });
  }
}

export default { data, execute };
