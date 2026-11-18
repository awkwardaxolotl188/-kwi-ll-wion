import { DEMO } from './demo.mjs';
import { TIERS, matchAnswer, etDate, resetAt, ROUND_MS, PREVIEW_MS } from './rules.mjs';

const KEY = 'ok_static_v2';
const load = () => JSON.parse(localStorage.getItem(KEY) || '{"puzzles":{},"runs":{}}');
const save = db => localStorage.setItem(KEY, JSON.stringify(db));
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function puzzleFor(db, date) {
  if (!db.puzzles[date]) {
    const prompts = DEMO.prompts;
    db.puzzles[date] = { date, dayNumber: Math.max(1, Math.floor((Date.parse(date) - Date.parse('2026-07-16')) / 86400000) + 1), source: DEMO.source, prompts };
    save(db);
  }
  return db.puzzles[date];
}

const promptDTO = p => ({ date: p.date, dayNumber: p.dayNumber, sample: false, source: p.source, resetsAt: resetAt(p.date), prompts: p.prompts.map(({ id, text }) => ({ id, text })) });
const stateDTO = (db, run) => {
  const results = Array.isArray(run.results) ? run.results : [];
  return { ...promptDTO(puzzleFor(db, run.date)), runId: run.id, mode: run.mode, round: run.next_round, roundStart: run.round_start, pausedAt: run.paused_at || null, serverNow: Date.now(), completed: !!run.completed, results, score: results.reduce((s, r) => s + (r.score || 0), 0) };
};

const origFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  if (!url.pathname.includes('/api/')) return origFetch(input, init);
  const path = url.pathname.slice(url.pathname.indexOf('/api/'));
  const db = load(), date = etDate();
  const data = init.body ? JSON.parse(init.body) : {};

  if (path === '/api/today') return json(promptDTO(puzzleFor(db, date)));
  if (path === '/api/health') return json({ ok: true, database: true, storage: false });
  if (path === '/api/state') {
    const run = db.runs[url.searchParams.get('run')];
    return run ? json({ state: stateDTO(db, run) }) : json({ error: 'Dive not found.' }, 404);
  }
  if (path === '/api/review') {
    const run = db.runs[url.searchParams.get('run')];
    if (!run?.completed) return json({ error: 'Finish your dive first.' }, 403);
    const puzzle = puzzleFor(db, run.date);
    return json({ prompts: puzzle.prompts.map(p => ({ ...p, answers: p.answers.map(a => ({ ...a, score: TIERS[a.tier].score })).sort((a, b) => b.score - a.score || a.answer.localeCompare(b.answer)) })), population: 0, betterThan: null, dist: Array(71).fill(0) });
  }
  if (path === '/api/start') {
    const mode = data.practice === true ? 'practice' : 'daily';
    puzzleFor(db, date);
    let run = mode === 'daily' ? Object.values(db.runs).find(r => r.date === date && r.mode === 'daily') : null;
    if (!run) {
      run = { id: crypto.randomUUID(), date, mode, next_round: 0, round_start: null, paused_at: null, completed: false, results: [] };
      db.runs[run.id] = run;
      save(db);
    }
    return json({ state: stateDTO(db, run) });
  }
  if (path === '/api/next' || path === '/api/round') {
    const run = db.runs[data.runId];
    if (!run) return json({ error: 'Dive not found.' }, 404);
    if (!run.completed && run.round_start === null) { run.round_start = Date.now() + PREVIEW_MS; save(db); }
    return json({ state: stateDTO(db, run) });
  }
  if (path === '/api/pause') {
    const run = db.runs[data.runId];
    if (run && !run.paused_at && run.round_start) { run.paused_at = Date.now(); save(db); }
    return json({ state: stateDTO(db, run) });
  }
  if (path === '/api/resume') {
    const run = db.runs[data.runId];
    if (run?.paused_at) { run.round_start += Date.now() - run.paused_at; run.paused_at = null; save(db); }
    return json({ state: stateDTO(db, run) });
  }
  if (path === '/api/answer') {
    const run = db.runs[data.runId];
    if (!run) return json({ error: 'Dive not found.' }, 404);
    if (run.completed || run.round_start === null || data.round !== run.next_round) return json({ state: stateDTO(db, run), alreadyScored: true });
    const puzzle = puzzleFor(db, run.date), prompt = puzzle.prompts[run.next_round];
    const raw = typeof data.answer === 'string' ? data.answer.trim().slice(0, 256) : '';
    const late = Date.now() > run.round_start + ROUND_MS;
    const match = raw && (!late || data.timeout === true) ? matchAnswer(raw, prompt.answers) : null;
    if (!match && raw && !late && !data.timeout) return json({ rejected: true, message: `“${raw}”: no echo. try again` });
    if (match?.correction && data.confirm !== true && !late && !data.timeout && data.previewCorrection !== false) return json({ correction: match.answer, original: raw });
    const result = { round: run.next_round, rawAnswer: raw || null, answer: match?.answer || null, tier: match?.tier || null, score: match ? TIERS[match.tier].score : 0, quip: match?.quip || null, promptText: prompt.text };
    run.results.push(result);
    run.next_round += 1;
    run.round_start = null;
    if (run.next_round >= 7) run.completed = true;
    save(db);
    return json({ result, state: stateDTO(db, run) });
  }
  return json({ ok: true });
};
