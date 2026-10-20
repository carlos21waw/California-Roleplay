import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isManagement } from '../../permissions/checkPermissions.js';
import { createBaseEmbed } from '../../embeds/embedBuilder.js';
import { buildStoreSelectMenu } from '../../select-menus/storeDropdown.js';
import { savePersistentPanel } from '../../database/db.js';
import config from '../../config/config.js';

export const data = new SlashCommandBuilder()
  .setName('store-panel')
  .setDescription('Publish the persistent Silence Designs Server Store Panel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!isManagement(interaction.member)) {
    return interaction.reply({ content: '❌ Only Management can publish the store panel.', ephemeral: true });
  }

  const embed = createBaseEmbed({
    title: '🛍️ View Our Server Store!',
    description: 'Explore our store and browse a curated selection of products — all from one centralized location.\n\n' +
      'All sales are final under the configured store policy. We do not offer refunds under any circumstances, subject to applicable law and platform requirements.\n\n' +
      `By purchasing any item, you agree to our Master Service Agreement:\n${config.masterServiceAgreementUrl}`,
    color: 0x06B6D4,
    fields: [
      {
        name: 'Available Categories',
        value: '• 🚀 **Server Booster Perks** — Exclusive roles & discounts\n' +
          '• 💎 **Silence Designs+ Perks** — Premium membership rank & VIP drops\n' +
          '• 💖 **Donations** — Small, medium, & large project contributions\n' +
          '• 📢 **Advertisements** — Instant postage, bypass queue & pings'
      }
    ],
    footerText: 'Select a category below to view items & purchase links.'
  });

  const row = buildStoreSelectMenu();

  const sent = await interaction.channel.send({
    embeds: [embed],
    components: [row]
  });

  await savePersistentPanel('store', interaction.guildId, interaction.channelId, sent.id);

  await interaction.reply({ content: '✅ Server Store Panel published and saved persistently!', ephemeral: true });
}

export default { data, execute };
