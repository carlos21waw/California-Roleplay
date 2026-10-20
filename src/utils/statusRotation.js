import statuses from '../config/statuses.js';

let currentIndex = 0;
let rotationInterval = null;

export function startStatusRotation(client, intervalMs = 30000) {
  if (rotationInterval) {
    clearInterval(rotationInterval);
  }

  const setStatus = () => {
    try {
      if (!client.user) return;
      const current = statuses[currentIndex];
      client.user.setPresence({
        activities: [{ name: current.name, type: current.type }],
        status: 'online'
      });
      currentIndex = (currentIndex + 1) % statuses.length;
    } catch (err) {
      console.error('[StatusRotation] Error updating presence:', err.message);
    }
  };

  // Immediate initial status
  setStatus();

  // Rotate every 30 seconds
  rotationInterval = setInterval(setStatus, intervalMs);
}

export function stopStatusRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }
}

export default {
  startStatusRotation,
  stopStatusRotation
};
