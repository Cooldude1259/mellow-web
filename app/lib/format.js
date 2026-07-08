// Pure formatting / rendering helpers. No app state, no DOM queries — safe to
// import anywhere. Extracted from script.js to keep the main module focused.

// HTML-escape untrusted text before dropping it into innerHTML.
export const esc = (s) => String(s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

// Cute campfire loading animation (self-contained; used for loading states).
export function loaderHtml(label = 'Toasting…') {
  return `<div class="mellow-loader"><div class="ml-stage"><span class="ml-marsh"></span><span class="ml-stick"></span><span class="ml-flame"></span></div><div class="ml-label">${esc(label)}</div></div>`;
}

export const fmtTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return isNaN(d) ? '' : d.toLocaleString();
};

export const initial = (name) => (name && name.trim() ? name.trim()[0].toUpperCase() : '?');

export const avatarHtml = (url, name, size = 34, extra = '') =>
  url
    ? `<img class="av" src="${esc(url)}" alt="" style="width:${size}px;height:${size}px;${extra}" />`
    : `<span class="av" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px;background:#0ea98f;${extra}">${esc(initial(name))}</span>`;

// Pull a count out of a Supabase `select('...', { count })` relation array.
export const cnt = (rel) => (Array.isArray(rel) && rel[0] ? rel[0].count : 0);

// Nudge a numeric text node up/down (like/dislike counters), clamped at 0.
export const setCount = (el, delta) => {
  el.textContent = Math.max(0, (parseInt(el.textContent, 10) || 0) + delta);
};
