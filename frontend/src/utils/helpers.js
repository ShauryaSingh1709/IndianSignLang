export const calculateLevel = (xp) => Math.floor(xp / 1000) + 1;
export const getXPProgress = (xp) => (xp % 1000) / 10;
export const formatDate = (date) => new Date(date).toLocaleDateString();
