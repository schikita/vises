// Mini-interpreter for the portal's obfuscated show/hide JS.
// Net visibility per element id = last .show()/.hide() in invocation order.
// Functions starting with `return false;` are no-ops (seen on live pages).
function evalShowHide(html) {
  // 1. invocation list: $(function(){fn1();fn2();...})
  const invokeMatch = html.match(/\$\(function\(\)\{([a-z0-9();]+)\}\)/i);
  if (!invokeMatch) return { ok: false, error: 'no invocation list' };
  const invoked = invokeMatch[1].split(';').map((s) => s.replace(/\(\)/g, '').trim()).filter(Boolean);

  // 2. function definitions: function NAME(){try{BODY}catch(...){...}}
  const defs = new Map();
  for (const fm of html.matchAll(/function ([a-z0-9]+)\(\)\s*\{try\{([\s\S]*?)\}catch\(([^)]*)\)\s*\{([^}]*)\}/gi)) {
    defs.set(fm[1], fm[2]);
  }

  // 3. apply in order
  const state = new Map(); // id -> 'show' | 'hide'
  let ops = 0;
  for (const name of invoked) {
    const body = defs.get(name);
    if (body === undefined) continue;
    if (/^\s*return\s+false\s*;/.test(body)) continue; // no-op function
    for (const op of body.matchAll(/\$\('#'\s*\+\s*document\.getElementById\('([a-z0-9]+)'\)\.id\)\.(show|hide)\(\)/gi)) {
      state.set(op[1], op[2].toLowerCase());
      ops += 1;
    }
  }
  return { ok: true, ops, state };
}

module.exports = { evalShowHide };

if (require.main === module) {
  const fs = require('fs');
  const file = process.argv[2];
  const html = fs.readFileSync(file, 'utf8');
  const res = evalShowHide(html);
  console.log('ok:', res.ok, 'ops:', res.ops);
  if (res.ok) {
    const shown = [...res.state.entries()].filter(([, v]) => v === 'show').map(([k]) => k);
    const hidden = [...res.state.entries()].filter(([, v]) => v === 'hide').map(([k]) => k);
    console.log('shown:', shown.join(','));
    console.log('hidden count:', hidden.length);
    // cross-reference: which password field ids are in the shown/not-hidden set?
    const pwIds = [...html.matchAll(/<input[^>]*type\s*=\s*"password"[^>]*id="([a-z0-9]+)"/gi)].map((m) => m[1]);
    const pwState = pwIds.map((id) => ({ id, op: res.state.get(id) || 'untouched' }));
    console.log('password fields:', JSON.stringify(pwState));
  }
}
