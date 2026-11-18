const a = (answer, tier, aliases = []) => ({ answer, tier, aliases });

// Tiers: 'plankton' (10) | 'tooclever' (15) | 'schooler' (30) | 'rare' (60) | 'deepcut' (85) | 'krillion' (100)
//npx wrangler deploy --config wrangler.production.jsonc to start
//DELETE FROM puzzles; DELETE FROM answers; DELETE FROM runs; in cloudflare console
//git add src/demo.mjs git commit -m "Add custom questions" git push 
// SAVES CHANGES I GOTTA DO THAT

const POOL = [
  {
    text: 'Question 1',
    answers: [
      a('Common answer', 'plankton', ['alias 1', 'alias 2']),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 2',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 3',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 4',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 5',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 6',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 7',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 8 (Bonus pool item)',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 9 (Bonus pool item)',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
  {
    text: 'Question 10 (Bonus pool item)',
    answers: [
      a('Common answer', 'plankton'),
      a('Medium answer', 'schooler'),
      a('Rare answer', 'rare'),
      a('Obscure answer', 'deepcut'),
      a('Best gem answer', 'krillion'),
    ],
  },
];

const pickSeven = () =>
  [...POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 7)
    .map((q, i) => ({ id: `p${i + 1}`, ...q }));

export const DEMO = {
  dayNumber: 1,
  source: 'Best Edition',
  get prompts() {
    return pickSeven();
  },
};
