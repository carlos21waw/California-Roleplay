import { SlashCommandBuilder } from 'discord.js';
import { createSuccessEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Test bot responsiveness and API roundtrip latency');

export async function execute(interaction) {
  const sent = await interaction.reply({ content: '🏓 Pinging Silence Designs gateway...', fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  const apiPing = interaction.client.ws.ping;

  const embed = createSuccessEmbed(
    'Pong! 🏓',
    `• **Roundtrip Latency:** \`${latency}ms\`\n• **Websocket Heartbeat:** \`${apiPing}ms\`\n• **Status:** Operational & Healthy`
  );

  await interaction.editReply({ content: null, embeds: [embed] });
}

export default { data, execute };
