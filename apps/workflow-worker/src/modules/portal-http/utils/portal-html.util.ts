/**
 * HTML helpers for the browserless portal flow: entity decoding, attribute
 * extraction, hidden-field parsing, decoy-field discovery (static CSS cascade),
 * and the static 3x3 captcha widget parser (port of the verified POC).
 */

export const decodeEntities = (s: string): string =>
  String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

export const readAttr = (tag: string, name: string): string | null => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return m ? decodeEntities(m[1]) : null;
};

/** CSS class cascade from <style> blocks, in source order (later rule wins). */
export const buildRuleMap = (html: string): Map<string, string[]> => {
  const ruleMap = new Map<string, string[]>();
  for (const sm of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const rm of sm[1]!.matchAll(/\.([a-z0-9]+)\s*\{([^}]*)\}/gi)) {
      const cls = rm[1]!;
      if (!ruleMap.has(cls)) ruleMap.set(cls, []);
      ruleMap.get(cls)!.push(rm[2]!);
    }
  }
  return ruleMap;
};

export const computedStyle = (ruleMap: Map<string, string[]>, classes: string[]): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const c of classes) {
    for (const d of ruleMap.get(c) || []) {
      for (const decl of d.split(';')) {
        const m = decl.match(/^\s*([a-z-]+)\s*:\s*([^;]+?)\s*$/);
        if (m) out[m[1]!] = m[2]!;
      }
    }
  }
  return out;
};

const displayValue = (c: Record<string, string>): string =>
  (c.display || '').replace(/\s*!important/, '');

/**
 * Decoy-field discovery (login email/password steps): the REAL field's wrapper
 * has display != none in the static cascade (real=block !important, decoys=none
 * !important — the obfuscated show/hide JS cannot override !important).
 */
export const findRealFieldInputs = (
  html: string,
  inputType: 'text' | 'password',
): { all: Array<{ id: string; name: string }>; real: { id: string; name: string } | null } => {
  const ruleMap = buildRuleMap(html);
  const result: Array<{ id: string; name: string; hidden: boolean }> = [];
  for (const wm of html.matchAll(
    new RegExp(
      `<div[^>]*class="(mb-3 position-relative[^"]*)"[^>]*>\\s*<label[^>]*for="([a-z0-9]+)"[^>]*>[\\s\\S]*?</label>\\s*<input[^>]*type\\s*=\\s*"${inputType}"[^>]*>`,
      'gi',
    ),
  )) {
    const c = computedStyle(ruleMap, wm[1]!.split(/\s+/));
    const inputTag = wm[0].match(/<input[^>]*>/i)?.[0] || '';
    result.push({
      id: wm[2]!,
      name: readAttr(inputTag, 'name') ?? wm[2]!,
      hidden: displayValue(c) === 'none' || c.visibility === 'hidden',
    });
  }
  const visible = result.filter((r) => !r.hidden);
  return {
    all: result.map(({ id, name }) => ({ id, name })),
    real: visible.length === 1 ? { id: visible[0]!.id, name: visible[0]!.name } : null,
  };
};

/** All hidden inputs of a form whose action contains actionSubstring. */
export const parseFormHiddens = (
  html: string,
  actionSubstring: string,
): Record<string, string> | null => {
  const formMatch = html.match(
    new RegExp(`<form[^>]*action="[^"]*${actionSubstring}[^"]*"[\\s\\S]*?</form>`, 'i'),
  );
  if (!formMatch) return null;
  const hiddens: Record<string, string> = {};
  for (const im of formMatch[0].matchAll(/<input([^>]*type\s*=\s*"hidden"[^>]*)>/gi)) {
    const name = readAttr(im[1]!, 'name');
    if (name) hiddens[name] = readAttr(im[1]!, 'value') ?? '';
  }
  return hiddens;
};

export type CaptchaTile = {
  id: string;
  hidden: boolean;
  z: number;
  left: number;
  top: number;
  b64: string;
};

export type ParsedCaptcha = {
  tiles: CaptchaTile[];
  labels: Array<{ id: string; target: string; hidden: boolean; z: number }>;
  cells: Map<string, CaptchaTile>;
  instr: { id: string; target: string } | null;
};

/** Static 3x3 captcha widget parser: topmost tile per grid cell + max-z instruction. */
export const parseCaptchaWidget = (html: string): ParsedCaptcha => {
  const ruleMap = buildRuleMap(html);
  const px = (v: string | undefined) => parseFloat(v || '0') || 0;
  const zOf = (c: Record<string, string>) =>
    c['z-index'] === undefined || c['z-index'] === 'auto' ? 0 : parseInt(c['z-index'], 10);
  const hidden = (c: Record<string, string>) =>
    displayValue(c) === 'none' || c.visibility === 'hidden';

  const tiles: CaptchaTile[] = [];
  for (const wm of html.matchAll(
    /<div\s+class="(col-4[^"]*)"\s+style="([^"]*)"\s+id="([^"]*)"[^>]*>\s*<img[^>]*class="captcha-img"[^>]*src="([^"]*)"/gi,
  )) {
    const c = computedStyle(ruleMap, wm[1]!.split(/\s+/));
    const src = decodeEntities(wm[4]!);
    const m = src.match(/^data:image\/[a-z+]+;base64,(.*)$/i);
    if (!m) continue;
    tiles.push({
      id: wm[3]!,
      hidden: hidden(c),
      z: zOf(c),
      left: px(c.left),
      top: px(c.top),
      b64: m[1]!,
    });
  }

  const labels: ParsedCaptcha['labels'] = [];
  for (const lm of html.matchAll(
    /<div\s+class='([^']*)'\s+id='([^']*)'[^>]*>\s*Please select all boxes with number (\d+)\s*<\/div>/gi,
  )) {
    const c = computedStyle(ruleMap, lm[1]!.split(/\s+/));
    labels.push({ id: lm[2]!, target: lm[3]!, hidden: hidden(c), z: zOf(c) });
  }

  const cells = new Map<string, CaptchaTile>();
  for (const t of tiles) {
    if (t.hidden) continue;
    const key = `${Math.round(t.left / 110)}_${Math.round(t.top / 110)}`;
    const prev = cells.get(key);
    if (!prev || t.z >= prev.z) cells.set(key, t);
  }
  let instr: ParsedCaptcha['instr'] = null;
  let instrZ = -1;
  for (const l of labels) {
    if (!l.hidden && l.z > instrZ) {
      instr = { id: l.id, target: l.target };
      instrZ = l.z;
    }
  }
  return { tiles, labels, cells, instr };
};
