import { SlashCommandBuilder } from 'discord.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('server-info')
  .setDescription('Display detailed statistics, roles, channels, and boost level of this server');

export async function execute(interaction) {
  const guild = interaction.guild;
  if (!guild) {
    return interaction.reply({ content: 'This command can only be executed within a server.', ephemeral: true });
  }

  const owner = await guild.fetchOwner().catch(() => null);
  const totalMembers = guild.memberCount;
  const totalChannels = guild.channels.cache.size;
  const totalRoles = guild.roles.cache.size;
  const boostCount = guild.premiumSubscriptionCount || 0;
  const boostTier = guild.premiumTier;

  const embed = createBaseEmbed({
    title: `🛡️ Server Information — ${guild.name}`,
    description: guild.description || 'Welcome to the official Silence Designs community server.',
    thumbnail: guild.iconURL({ dynamic: true }) || undefined,
    color: 0x181B22,
    fields: [
      { name: 'Owner', value: owner ? `<@${owner.id}> (\`${owner.user.tag}\`)` : 'Unknown', inline: true },
      { name: 'Server ID', value: `\`${guild.id}\``, inline: true },
      { name: 'Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
      { name: 'Members', value: `👥 **${totalMembers.toLocaleString()}** members`, inline: true },
      { name: 'Channels', value: `📁 **${totalChannels}** channels`, inline: true },
      { name: 'Roles', value: `🏷️ **${totalRoles}** roles`, inline: true },
      { name: 'Boost Level', value: `🚀 Level ${boostTier} (${boostCount} boosts)`, inline: true },
      { name: 'Verification Level', value: `\`${guild.verificationLevel}\``, inline: true },
      { name: 'Explicit Content Filter', value: `\`${guild.explicitContentFilter}\``, inline: true }
    ],
    footerText: 'Silence Designs Community Hub'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
