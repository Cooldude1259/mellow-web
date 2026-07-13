// Area cosmetic metadata (colour / blurb / emoji) + lookups. Pure data + pure
// functions — the source of truth for how each area looks in the UI.

const AREA_COLORS = {
  'school news': '#2f6bff', 'news': '#2f6bff',
  'sports': '#18a957',
  'clubs': '#7c5cfc',
  'events': '#ff6b57',
  'help & homework': '#f5a524', 'help': '#f5a524', 'homework': '#f5a524',
  'random': '#11b5b0',
};
const AREA_BLURBS = {
  'school news': 'Never miss what\'s happening', 'news': 'Never miss what\'s happening',
  'sports': 'Cheer the teams on',
  'clubs': 'Find your people',
  'events': 'See what\'s coming up',
  'help & homework': 'Ask anything — we\'ve got you', 'help': 'Ask anything — we\'ve got you',
  'random': 'Hang out and be yourself',
};
const AREA_EMOJIS = {
  'school news': '📰', 'news': '📰',
  'sports': '🏀', 'clubs': '🎭', 'events': '🎉',
  'help & homework': '📚', 'help': '📚', 'random': '💬',
};

export const areaColor = (name) => AREA_COLORS[(name || '').toLowerCase()] || '#0ea98f';
export const areaBlurb = (name) => AREA_BLURBS[(name || '').toLowerCase()] || 'Explore this area';
export const areaEmoji = (a) => a.emoji || AREA_EMOJIS[(a.name || '').toLowerCase()] || '📌';
