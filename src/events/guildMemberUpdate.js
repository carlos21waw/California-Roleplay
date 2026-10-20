import { Events } from 'discord.js';
import config from '../config/config.js';
import { createBaseEmbed } from '../embeds/embedBuilder.js';
import logger from '../services/logger.js';

export const name = Events.GuildMemberUpdate;

export async function execute(oldMember, newMember) {
  // Detect genuine Discord server boost
  const wasBoosting = Boolean(oldMember.premiumSince);
  const isBoosting = Boolean(newMember.premiumSince);

  if (!wasBoosting && isBoosting) {
    logger.info(`[Booster] Member ${newMember.user.tag} boosted the server!`);

    // Assign booster role if configured
    if (config.roles.booster) {
      await newMember.roles.add(config.roles.booster).catch(() => null);
    }

    if (config.channels.welcome) {
      const channel = await newMember.guild.channels.fetch(config.channels.welcome).catch(() => null);
      if (channel) {
        const embed = createBaseEmbed({
          title: `🚀 We're excited to have you, @${newMember.user.username}!`,
          description: `Thank you so much for boosting **${newMember.guild.name}**!\n\n` +
            `Your booster perks are now active:\n` +
            `• Exclusive <@&${config.roles.booster || ''}> role\n` +
            `• 5% discount on all eligible Silence Designs orders\n` +
            `• Media posting permissions\n` +
            `• Exclusive booster giveaways & sneak peek releases\n\n` +
            `We hope you love it — enjoy!`,
          color: 0xEC4899,
          thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
          footerText: 'Silence Designs Booster Perks'
        });

        await channel.send({
          content: `🎉 <@${newMember.id}> just boosted the server!`,
          embeds: [embed]
        }).catch(() => null);
      }
    }
  }
}

export default { name, execute };
