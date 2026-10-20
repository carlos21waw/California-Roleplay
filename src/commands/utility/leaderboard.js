import { SlashCommandBuilder } from 'discord.js';
import { getLeaderboard } from '../../database/db.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the community leaderboard for orders completed and reputation');

export async function execute(interaction) {
  const topUsers = await getLeaderboard(10);

  if (!topUsers || topUsers.length === 0) {
    return interaction.reply({
      content: '📊 No client statistics recorded yet. Place orders to top the leaderboard!',
      ephemeral: true
    });
  }

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  const rows = topUsers.map((u, i) =>
    `${medals[i] || '•'} <@${u.user_id}> — **${u.orders_completed}** Orders | ⭐ **${u.reputation}** Rep`
  );

  const embed = createBaseEmbed({
    title: '🏆 Silence Designs Community Leaderboard',
    description: 'Recognizing our most loyal clients and top community contributors:\n\n' + rows.join('\n'),
    color: 0xEAB308,
    footerText: 'Silence Designs Reputation Rankings'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
