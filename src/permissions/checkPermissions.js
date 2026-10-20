import { PermissionFlagsBits } from 'discord.js';
import config from '../config/config.js';

/**
 * Validates member permission level within Silence Designs
 */
export function isBotOwner(userId) {
  return userId === config.ownerId || userId === config.developerId;
}

export function isExecutive(member) {
  if (!member) return false;
  if (isBotOwner(member.id)) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (config.roles.executive && member.roles.cache.has(config.roles.executive)) return true;
  return false;
}

export function isManagement(member) {
  if (!member) return false;
  if (isExecutive(member)) return true;
  if (config.roles.management && member.roles.cache.has(config.roles.management)) return true;
  return false;
}

export function isStaff(member) {
  if (!member) return false;
  if (isManagement(member)) return true;
  if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) return true;
  if (config.roles.staff && member.roles.cache.has(config.roles.staff)) return true;
  return false;
}

export function isDesigner(member) {
  if (!member) return false;
  if (isStaff(member)) return true;
  if (config.roles.designer && member.roles.cache.has(config.roles.designer)) return true;
  return false;
}

/**
 * Checks if staff member has hierarchy authority over target member
 */
export function canModerate(moderatorMember, targetMember) {
  if (!moderatorMember || !targetMember) return false;
  if (targetMember.id === moderatorMember.id) return false;
  if (targetMember.id === moderatorMember.guild.ownerId) return false;
  if (isBotOwner(moderatorMember.id)) return true;

  // Role hierarchy check
  return moderatorMember.roles.highest.position > targetMember.roles.highest.position;
}

export default {
  isBotOwner,
  isExecutive,
  isManagement,
  isStaff,
  isDesigner,
  canModerate
};
