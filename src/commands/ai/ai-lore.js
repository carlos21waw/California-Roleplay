import { SlashCommandBuilder } from 'discord.js';
import { generateDesignContent, isAiConfigured } from '../../services/geminiAiService.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ai-lore')
  .setDescription('Generate background lore, history, and founding backstory for your roleplay department')
  .addStringOption(option =>
    option
      .setName('department_name')
      .setDescription('Name of the agency or jurisdiction (e.g. Blackwood County Sheriff, North River Police)')
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
  const dept = interaction.options.getString('department_name');

  try {
    const prompt = `Write an engaging, immersive roleplay backstory and lore overview for the emergency department: "${dept}". Include:
1. Founding Era & Regional Geography
2. Notable Historic Milestones & Mottos
3. Current Jurisdiction & Divisions (Patrol, Traffic, Special Operations)
4. Reputation in Liberty County or roleplay setting. Keep it professional, realistic, and formatted with markdown.`;

    const result = await generateDesignContent(prompt);

    const embed = createBaseEmbed({
      title: `📖 Department Lore — ${dept}`,
      description: result,
      color: 0x181B22,
      footerText: 'Silence Designs AI Lore Builder'
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({
      embeds: [createErrorEmbed('AI Generation Error', err.message)]
    });
  }
}

export default { data, execute };
