import { SlashCommandBuilder } from 'discord.js';
import { getOrCreateUserProfile, getUserOrders } from '../../database/db.js';
import { getRobloxUserInfo } from '../../services/robloxService.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your Silence Designs client profile, reputation, and order history')
  .addUserOption(option => option.setName('user').setDescription('View another member\'s profile').setRequired(false));

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const profile = await getOrCreateUserProfile(targetUser.id);
  const userOrders = await getUserOrders(targetUser.id);

  let robloxInfo = null;
  if (profile.roblox_username) {
    robloxInfo = await getRobloxUserInfo(profile.roblox_username);
  }

  const embed = createBaseEmbed({
    title: `👤 Client Profile — @${targetUser.username}`,
    thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
    color: 0x38BDF8,
    fields: [
      { name: 'Discord ID', value: `\`${targetUser.id}\``, inline: true },
      {
        name: 'Linked Roblox Account',
        value: profile.roblox_username
          ? `[${profile.roblox_username}](${robloxInfo?.profileUrl || 'https://www.roblox.com'})`
          : '*Not set (use /settings)*',
        inline: true
      },
      { name: 'Reputation', value: `⭐ **${profile.reputation}** rep`, inline: true },
      { name: 'Completed Orders', value: `📦 **${profile.orders_completed}** order(s)`, inline: true },
      { name: 'Active Orders', value: `⏳ **${userOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length}** active`, inline: true },
      { name: 'Reviews Left', value: `✍️ **${profile.reviews_given}** review(s)`, inline: true },
      { name: 'Client Bio', value: `>>> ${profile.bio || 'Silence Designs Client'}` },
      { name: 'Member Since', value: `<t:${Math.floor(profile.created_at / 1000)}:D>`, inline: true }
    ],
    footerText: 'Silence Designs Community Profile'
  });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
