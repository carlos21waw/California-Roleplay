import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import config from '../../config/config.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed, createErrorEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('View active bot configuration, assigned role IDs, and operational settings')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({
      embeds: [createErrorEmbed('Permission Denied', 'Only Management or Executive members can view bot settings.')],
      ephemeral: true
    });
  }

  const roleList = Object.entries(config.roles)
    .map(([k, v]) => `• **${k}:** ${v ? `<@&${v}> (\`${v}\`)` : '*Not set*'}`)
    .join('\n');

  const channelList = Object.entries(config.channels)
    .map(([k, v]) => `• **${k}:** ${v ? `<#${v}> (\`${v}\`)` : '*Not set*'}`)
    .join('\n');

  const embed = createBaseEmbed({
    title: '⚙️ Silence Designs — Bot Configuration & Settings',
    description: 'Active runtime configuration loaded from `.env` and SQLite database.\n*(Secrets and bot tokens are never displayed in Discord).*',
    color: 0x38BDF8,
    fields: [
      { name: 'Server Guild ID', value: `\`${config.guildId || interaction.guildId}\``, inline: true },
      { name: 'Application Client ID', value: `\`${config.clientId || interaction.client.user.id}\``, inline: true },
      { name: 'Lead Developer ID', value: `\`${config.developerId}\``, inline: true },
      { name: 'Roblox Group ID', value: `\`${config.roblox.defaultGroupId}\``, inline: true },
      { name: 'AI Integration', value: config.geminiApiKey ? '🟢 Gemini API Configured' : '⚪ Gemini API Optional (Unset)', inline: true },
      { name: 'Configured Server Roles', value: roleList || 'None' },
      { name: 'Configured Channels & Categories', value: channelList || 'None' }
    ],
    footerText: 'To update settings, edit your local .env file or configuration modules.'
  });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

export default { data, execute };
