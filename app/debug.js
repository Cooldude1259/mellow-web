/* Mellow debug mode (loaded only with ?debug).
   Shows script.js on screen and lights up the exact line each trace() fires on,
   with a running event log — a "watch what's firing" panel for devlog videos. */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    #dbgPanel{position:fixed;top:0;right:0;width:46vw;max-width:720px;height:100vh;z-index:3000;
      background:#0e1116;color:#c7d0dc;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
      display:flex;flex-direction:column;box-shadow:-8px 0 30px rgba(0,0,0,.5)}
    #dbgHead{padding:9px 14px;background:#141922;color:#e6edf5;font-weight:700;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #222a36}
    #dbgHead #dbgNow{color:#19c3a6;font-weight:600}
    #dbgHead button{background:#222a36;color:#c7d0dc;border:none;border-radius:6px;padding:4px 9px;cursor:pointer;font:inherit}
    #dbgCode{flex:1;overflow:auto;margin:0;padding:8px 0;white-space:pre;tab-size:2}
    #dbgCode .dl{display:block;padding:0 14px 0 0;transition:background .2s}
    #dbgCode .ln{display:inline-block;width:46px;text-align:right;margin-right:14px;color:#4b5666;user-select:none}
    #dbgCode .dl.hot{background:linear-gradient(90deg,rgba(25,195,166,.38),rgba(25,195,166,.06));box-shadow:inset 3px 0 0 #19c3a6;animation:dbgpulse 1s ease}
    @keyframes dbgpulse{0%{background:rgba(25,195,166,.7)}100%{background:rgba(25,195,166,.1)}}
    #dbgCode .k{color:#c792ea}#dbgCode .s{color:#c3e88d}#dbgCode .c{color:#5b6675;font-style:italic}#dbgCode .n{color:#f78c6c}
    #dbgLog{height:150px;overflow:auto;border-top:1px solid #222a36;background:#0b0e13;padding:6px 12px}
    #dbgLog .e{padding:2px 0;color:#9fb0c3}#dbgLog .e b{color:#19c3a6}#dbgLog .e span{color:#4b5666}
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'dbgPanel';
  panel.innerHTML = '<div id="dbgHead"><span>script.js &nbsp;<span id="dbgNow"></span></span><button id="dbgHide">hide</button></div><pre id="dbgCode">loading source…</pre><div id="dbgLog"></div>';
  document.body.appendChild(panel);
  panel.querySelector('#dbgHide').onclick = () => panel.remove();

  const codeEl = panel.querySelector('#dbgCode');
  const logEl = panel.querySelector('#dbgLog');
  const nowEl = panel.querySelector('#dbgNow');
  let lineEls = [];

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Single-pass tokenizer so highlighting never re-matches inside its own tags.
  function hl(line) {
    const re = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|await|async|for|of|in|new|class|try|catch|throw|typeof|true|false|null)\b|\b(\d+(?:\.\d+)?)\b/g;
    let out = '', last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += '<i class="c">' + esc(m[1]) + '</i>';
      else if (m[2]) out += '<i class="s">' + esc(m[2]) + '</i>';
      else if (m[3]) out += '<i class="k">' + esc(m[3]) + '</i>';
      else if (m[4]) out += '<i class="n">' + esc(m[4]) + '</i>';
      last = re.lastIndex;
    }
    out += esc(line.slice(last));
    return out;
  }

  fetch('script.js').then((r) => r.text()).then((src) => {
    const lines = src.split('\n');
    codeEl.innerHTML = lines.map((ln, i) => `<span class="dl" data-l="${i + 1}"><span class="ln">${i + 1}</span>${hl(ln)}</span>`).join('');
    lineEls = Array.from(codeEl.querySelectorAll('.dl'));
  });

  window.__dbgHighlight = function (line, label) {
    const el = lineEls[line - 1];
    if (el) {
      el.classList.remove('hot'); void el.offsetWidth; el.classList.add('hot');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    if (label) {
      nowEl.textContent = '→ ' + label;
      const e = document.createElement('div');
      e.className = 'e';
      e.innerHTML = `<b>${label}</b> <span>script.js:${line}</span>`;
      logEl.prepend(e);
      while (logEl.children.length > 40) logEl.lastChild.remove();
    }
  };
})();
