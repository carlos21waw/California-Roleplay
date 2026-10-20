import { SlashCommandBuilder, version as djsVersion } from 'discord.js';
import config from '../../config/config.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('botinfo')
  .setDescription('Display bot system information, versions, uptime, and developer profile');

export async function execute(interaction) {
  const client = interaction.client;
  const uptimeSeconds = Math.floor(process.uptime());
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  const ping = client.ws.ping;
  const guildCount = client.guilds.cache.size;
  const userCount = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
  const commandCount = client.commands ? client.commands.size : 50;

  const currentActivity = client.user?.presence?.activities[0]?.name || '🌿 Powering Silence Designs';

  const embed = createBaseEmbed({
    title: `🤖 Bot Information — ${config.botName}`,
    description: `Professional Discord bot for **Silence Designs** ER:LC livery & design team. Built with high-fidelity architecture, SQLite persistence, and modern discord.js v14.`,
    thumbnail: client.user?.displayAvatarURL({ dynamic: true }) || undefined,
    color: 0x38BDF8,
    fields: [
      { name: 'Bot Name', value: config.botName, inline: true },
      { name: 'Bot Version', value: `\`v${config.botVersion}\``, inline: true },
      { name: 'discord.js', value: `\`v${djsVersion}\``, inline: true },
      { name: 'Node.js', value: `\`${process.version}\``, inline: true },
      { name: 'Uptime', value: `\`${uptimeString}\``, inline: true },
      { name: 'Websocket Ping', value: `\`${ping}ms\``, inline: true },
      { name: 'Servers', value: `🌐 **${guildCount}** server(s)`, inline: true },
      { name: 'Users Served', value: `👥 **${userCount.toLocaleString()}** users`, inline: true },
      { name: 'Commands Registered', value: `⚡ **${commandCount}+** commands`, inline: true },
      { name: 'Current Activity', value: `\`${currentActivity}\``, inline: false },
      {
        name: 'Lead Developer',
        value: `👤 **${config.developerTag}** (\`${config.developerId}\`)\nDeveloper Profile: <@${config.developerId}>`,
        inline: false
      }
    ],
    footerText: 'Silence Designs — Your vision. Our design.'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
