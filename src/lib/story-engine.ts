// Framework-free branching-story engine.
// The standalone HTML re-implements the same logic inline.

export type StoryCard = {
  label: string;
  reveal: string;
  next: string;
  if?: string;
  set?: Record<string, number | boolean | string>;
};

export type StoryScene = {
  prompt?: string;
  cards?: StoryCard[];
  final?: string;
};

export type StoryData = {
  id: string;
  start: string;
  vars?: Record<string, number | boolean | string>;
  scenes: Record<string, StoryScene>;
};

export type StoryState = {
  sceneId: string;
  vars: Record<string, number | boolean | string>;
  history: Array<{ sceneId: string; vars: Record<string, number | boolean | string> }>;
};

const storageKey = (id: string) => `story:${id}`;

export function initialState(data: StoryData): StoryState {
  return {
    sceneId: data.start,
    vars: { ...(data.vars ?? {}) },
    history: [],
  };
}

export function loadState(data: StoryData): StoryState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(data.id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoryState;
    if (!parsed.sceneId || !data.scenes[parsed.sceneId]) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(data: StoryData, state: StoryState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(data.id), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearSaved(data: StoryData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(data.id));
  } catch {
    /* ignore */
  }
}

// --- Safe expression evaluator -------------------------------------------
type Token =
  | { t: "id"; v: string }
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "op"; v: string }
  | { t: "lp" }
  | { t: "rp" };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t") { i++; continue; }
    if (c === "(") { tokens.push({ t: "lp" }); i++; continue; }
    if (c === ")") { tokens.push({ t: "rp" }); i++; continue; }
    if (c === "!" && src[i + 1] !== "=") { tokens.push({ t: "op", v: "!" }); i++; continue; }
    const two = src.slice(i, i + 2);
    if (["==", "!=", ">=", "<=", "&&", "||"].includes(two)) {
      tokens.push({ t: "op", v: two }); i += 2; continue;
    }
    if (c === ">" || c === "<") { tokens.push({ t: "op", v: c }); i++; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j++;
      tokens.push({ t: "str", v: src.slice(i + 1, j) });
      i = j + 1; continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      tokens.push({ t: "num", v: Number(src.slice(i, j)) });
      i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (word === "true") tokens.push({ t: "bool", v: true });
      else if (word === "false") tokens.push({ t: "bool", v: false });
      else tokens.push({ t: "id", v: word });
      i = j; continue;
    }
    throw new Error(`Unexpected character: ${c}`);
  }
  return tokens;
}

export function evalCondition(
  expr: string,
  vars: Record<string, number | boolean | string>,
): boolean {
  const tokens = tokenize(expr);
  let p = 0;
  const peek = (): Token | undefined => tokens[p];
  const eat = (): Token | undefined => tokens[p++];
  const toBool = (v: unknown) => Boolean(v);

  const parseAtom = (): unknown => {
    const tok = eat();
    if (!tok) throw new Error("Unexpected end");
    if (tok.t === "num") return tok.v;
    if (tok.t === "str") return tok.v;
    if (tok.t === "bool") return tok.v;
    if (tok.t === "id") return vars[tok.v];
    if (tok.t === "lp") {
      const v = parseOr();
      const rp = eat();
      if (!rp || rp.t !== "rp") throw new Error("Missing )");
      return v;
    }
    if (tok.t === "op" && tok.v === "!") return !toBool(parseAtom());
    throw new Error("Unexpected token");
  };

  const parseCmp = (): unknown => {
    const left = parseAtom();
    const tok = peek();
    if (tok && tok.t === "op" && ["==", "!=", ">", "<", ">=", "<="].includes(tok.v)) {
      eat();
      const right = parseAtom();
      const l = left as number;
      const r = right as number;
      switch (tok.v) {
        case "==": return left === right;
        case "!=": return left !== right;
        case ">": return l > r;
        case "<": return l < r;
        case ">=": return l >= r;
        case "<=": return l <= r;
      }
    }
    return left;
  };

  const parseAnd = (): unknown => {
    let left = parseCmp();
    let tok = peek();
    while (tok && tok.t === "op" && tok.v === "&&") {
      eat();
      const right = parseCmp();
      left = toBool(left) && toBool(right);
      tok = peek();
    }
    return left;
  };

  const parseOr = (): unknown => {
    let left = parseAnd();
    let tok = peek();
    while (tok && tok.t === "op" && tok.v === "||") {
      eat();
      const right = parseAnd();
      left = toBool(left) || toBool(right);
      tok = peek();
    }
    return left;
  };

  const result = parseOr();
  if (p !== tokens.length) throw new Error("Trailing tokens");
  return toBool(result);
}

export function visibleCards(scene: StoryScene, vars: StoryState["vars"]): StoryCard[] {
  if (!scene.cards) return [];
  return scene.cards.filter((c) => {
    if (!c.if) return true;
    try { return evalCondition(c.if, vars); } catch { return false; }
  });
}

export function choose(
  data: StoryData,
  state: StoryState,
  cardIndex: number,
): StoryState {
  const scene = data.scenes[state.sceneId];
  const visible = visibleCards(scene, state.vars);
  const card = visible[cardIndex];
  if (!card) return state;
  const nextVars = { ...state.vars, ...(card.set ?? {}) };
  return {
    sceneId: card.next,
    vars: nextVars,
    history: [...state.history, { sceneId: state.sceneId, vars: state.vars }],
  };
}

export function back(state: StoryState): StoryState {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  return {
    sceneId: prev.sceneId,
    vars: prev.vars,
    history: state.history.slice(0, -1),
  };
}
