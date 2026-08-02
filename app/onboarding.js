// Onboarding — collect the minimum (DOB + country + consent), let the
// `age-onboard` edge function derive/store the tier server-side, then apply
// its decision. Runs once for new users. DOB never comes back to the client.

const COUNTRIES = [
  ['AU', 'Australia'], ['NZ', 'New Zealand'], ['US', 'United States'], ['GB', 'United Kingdom'],
  ['CA', 'Canada'], ['IE', 'Ireland'], ['DE', 'Germany'], ['FR', 'France'], ['NL', 'Netherlands'],
  ['ES', 'Spain'], ['IT', 'Italy'], ['SE', 'Sweden'], ['NO', 'Norway'], ['DK', 'Denmark'],
  ['FI', 'Finland'], ['PL', 'Poland'], ['PT', 'Portugal'], ['AT', 'Austria'], ['BE', 'Belgium'],
  ['CH', 'Switzerland'], ['IN', 'India'], ['SG', 'Singapore'], ['JP', 'Japan'], ['KR', 'South Korea'],
  ['ZA', 'South Africa'], ['BR', 'Brazil'], ['MX', 'Mexico'], ['AR', 'Argentina'], ['PH', 'Philippines'],
  ['ID', 'Indonesia'], ['MY', 'Malaysia'], ['ZZ', 'Other / not listed'],
];

// Guard against concurrent calls. applyAuthState can fire on both
// INITIAL_SESSION and SIGNED_IN, so ensureOnboarded may run several times —
// we must only ever build one modal. Concurrent callers share one promise.
let _inflight = null;

export async function ensureOnboarded(supabase, user) {
  if (!user) return null;
  if (_inflight) return _inflight;
  try {
    const { data } = await supabase.from('user_ages').select('decided_tier').eq('user_id', user.id).maybeSingle();
    if (data && data.decided_tier) return data.decided_tier;
  } catch (e) { /* fall through to onboarding */ }
  if (_inflight) return _inflight;
  if (document.querySelector('#obDob')) return _inflight || null;
  _inflight = runOnboarding(supabase).finally(() => { _inflight = null; });
  return _inflight;
}

function runOnboarding(supabase) {
  return new Promise((resolve) => {
    const today = new Date().toISOString().slice(0, 10);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '4000';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:420px">
        <div class="modal-header">Welcome to Mellow 🔥</div>
        <div class="modal-body">
          <p style="color:var(--text-muted);font-size:14px">Two quick things so we can look after you properly. We only ever ask for these.</p>
          <label style="font-weight:600;font-size:13px">Date of birth
            <input type="date" id="obDob" max="${today}" style="margin-top:4px" />
          </label>
          <label style="font-weight:600;font-size:13px">Country
            <select id="obCountry" style="margin-top:4px">
              <option value="">Choose…</option>
              ${COUNTRIES.map(([c, n]) => `<option value="${c}">${n}</option>`).join('')}
            </select>
          </label>
          <label style="display:flex;gap:9px;align-items:flex-start;font-size:13px;color:var(--text-body);cursor:pointer">
            <input type="checkbox" id="obConsent" style="margin-top:3px;width:auto;min-height:auto" />
            <span>I agree to the Terms &amp; Privacy Policy.</span>
          </label>
          <div id="obStatus" style="min-height:18px;font-size:13px;color:var(--danger);text-align:center"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary-modal" id="obSubmit">Continue</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const $ = (id) => overlay.querySelector('#' + id);
    const status = $('obStatus');
    const submit = $('obSubmit');

    submit.addEventListener('click', async () => {
      const dob = $('obDob').value;
      const country = $('obCountry').value;
      const consent = $('obConsent').checked;
      if (!dob) { status.textContent = 'Please enter your date of birth.'; return; }
      if (!country) { status.textContent = 'Please choose your country.'; return; }
      if (!consent) { status.textContent = 'Please agree to the Terms & Privacy Policy.'; return; }
      submit.disabled = true; status.style.color = 'var(--text-muted)'; status.textContent = 'Setting things up…';
      try {
        const { data, error } = await supabase.functions.invoke('age-onboard', { body: { dob, country, consent } });
        if (error || !data?.ok) throw new Error(data?.error || error?.message || 'failed');
        status.style.color = 'var(--primary)';
        status.textContent = data.message || 'You\'re all set!';
        setTimeout(() => { overlay.remove(); resolve(data.tier); }, data.needs_guardian || !data.supported ? 2600 : 900);
      } catch (err) {
        submit.disabled = false; status.style.color = 'var(--danger)';
        status.textContent = 'Something went wrong — please try again.';
        console.error('onboarding failed', err);
      }
    });
  });
}
