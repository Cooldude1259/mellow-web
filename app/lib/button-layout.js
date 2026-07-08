// Persistence for where the floating motion / shredder buttons dock. Self-
// contained (localStorage only); the DOM application lives back in script.js.

export const BUTTON_LAYOUT_KEY = 'mellow_button_layout';
export const BUTTON_PLACEMENTS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
export const DEFAULT_BUTTON_LAYOUT = { motionOffBtn: 'top-right', shredGuiBtn: 'bottom-left' };

export function normalizePlacement(value, fallback) {
  return BUTTON_PLACEMENTS.includes(value) ? value : fallback;
}

export function readButtonLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(BUTTON_LAYOUT_KEY) || '{}');
    return {
      motionOffBtn: normalizePlacement(saved.motionOffBtn, DEFAULT_BUTTON_LAYOUT.motionOffBtn),
      shredGuiBtn: normalizePlacement(saved.shredGuiBtn, DEFAULT_BUTTON_LAYOUT.shredGuiBtn),
    };
  } catch (e) {
    return { ...DEFAULT_BUTTON_LAYOUT };
  }
}

export function saveButtonLayout(nextLayout) {
  try { localStorage.setItem(BUTTON_LAYOUT_KEY, JSON.stringify(nextLayout)); } catch (e) {}
}
