import config from '../config/config.js';
import logger from './logger.js';

/**
 * Fetches public Roblox group details from official Roblox Web API.
 * Falls back to configured reference data if network request fails.
 */
export async function getRobloxGroupInfo(groupId = config.roblox.defaultGroupId) {
  try {
    const res = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        memberCount: data.memberCount,
        created: new Date(data.created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        owner: {
          id: data.owner?.userId || '1010752321',
          username: data.owner?.username || config.roblox.defaultOwnerUsername,
          profileUrl: `https://www.roblox.com/users/${data.owner?.userId || '1010752321'}`
        },
        groupUrl: `https://www.roblox.com/communities/${data.id}`,
        isLive: true
      };
    }
  } catch (err) {
    logger.warn('[RobloxService] Could not reach official Roblox API, using reference data:', err.message);
  }

  // Fallback to configured reference data
  return {
    id: config.roblox.defaultGroupId,
    name: config.roblox.defaultGroupName,
    description: config.roblox.defaultDescription,
    memberCount: config.roblox.referenceMemberCount,
    created: config.roblox.referenceCreatedDate,
    owner: {
      id: '1010752321',
      username: config.roblox.defaultOwnerUsername,
      profileUrl: config.roblox.defaultOwnerProfile
    },
    groupUrl: config.roblox.defaultGroupUrl,
    isLive: false
  };
}

/**
 * Validates and fetches Roblox user profile details by username
 */
export async function getRobloxUserInfo(username) {
  if (!username) return null;
  try {
    const searchRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.data && searchData.data.length > 0) {
        const user = searchData.data[0];
        // Fetch detailed profile for join date
        const detailRes = await fetch(`https://users.roblox.com/v1/users/${user.id}`);
        let joinedDate = null;
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          joinedDate = new Date(detailData.created).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        return {
          id: user.id,
          username: user.name,
          displayName: user.displayName,
          profileUrl: `https://www.roblox.com/users/${user.id}/profile`,
          joinedDate
        };
      }
    }
  } catch (err) {
    logger.warn('[RobloxService] User lookup error:', err.message);
  }

  return {
    id: null,
    username,
    displayName: username,
    profileUrl: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(username)}`,
    joinedDate: null
  };
}

export default {
  getRobloxGroupInfo,
  getRobloxUserInfo
};
