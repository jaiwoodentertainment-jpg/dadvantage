import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Database from 'better-sqlite3';
import 'dotenv/config';

const app = express();
app.use(express.json());

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Database setup ───────────────────────────────────────────────────────────

const db = new Database('community.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS daily_quotes (
    date TEXT PRIMARY KEY,
    quote TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  );
`);

// Seed daily quotes Jan 1 – Mar 9 2026
const HISTORICAL_QUOTES: Record<string, string> = {
  '2026-01-01': 'A new year is just a new chance to be the dad you\'ve always wanted to be.',
  '2026-01-02': 'Your kids will forget most of what you said. They\'ll never forget how you made them feel.',
  '2026-01-03': 'The greatest gift you can give your children is your undivided attention.',
  '2026-01-04': 'You don\'t have to be perfect to be an amazing dad — you just have to keep showing up.',
  '2026-01-05': 'Every bedtime story you read is a memory they\'ll carry for the rest of their lives.',
  '2026-01-06': 'Fatherhood isn\'t about having all the answers — it\'s about being willing to figure it out together.',
  '2026-01-07': 'Your presence at the dinner table is worth more than any gift you\'ll ever buy.',
  '2026-01-08': 'The patience you show today is the patience your kids will show the world tomorrow.',
  '2026-01-09': 'Being a dad means loving someone so much that their wins feel better than your own.',
  '2026-01-10': 'You are already the hero in your child\'s story — live up to that every single day.',
  '2026-01-11': 'Small moments, repeated daily, build the strongest bonds.',
  '2026-01-12': 'The way you speak to your children becomes their inner voice.',
  '2026-01-13': 'A dad who reads, a dad who listens, a dad who shows up — that\'s the whole game.',
  '2026-01-14': 'Your kids are watching you. Make sure what they see inspires them.',
  '2026-01-15': 'It\'s okay to not have it all figured out — what matters is that you never stop trying.',
  '2026-01-16': 'Every time you choose your family over your phone, you\'re making a deposit into their hearts.',
  '2026-01-17': 'The laughter you share with your kids today is the story they\'ll tell when they\'re grown.',
  '2026-01-18': 'A man who is present for his children is a man who will never have regrets.',
  '2026-01-19': 'Your consistency is your greatest parenting tool — show up the same way, every single day.',
  '2026-01-20': 'Strength isn\'t never struggling. It\'s struggling and showing up anyway.',
  '2026-01-21': 'You were chosen for these specific kids — no accident, no mistake. You are exactly who they need.',
  '2026-01-22': 'The apology you give your child teaches them more than any lecture ever could.',
  '2026-01-23': 'Be the kind of father that makes your child think all dads are superheroes.',
  '2026-01-24': 'Hard days don\'t make you a bad dad. How you recover from them does.',
  '2026-01-25': 'Your kids don\'t need a dad who is always happy. They need a dad who is always honest.',
  '2026-01-26': 'Put the work in on ordinary days and the big moments will take care of themselves.',
  '2026-01-27': 'The conversations you have in the car are the ones they\'ll remember forever.',
  '2026-01-28': 'A father who listens more than he speaks raises children who feel truly seen.',
  '2026-01-29': 'Love your kids loud enough that they never question it.',
  '2026-01-30': 'You are writing the story your children will one day tell their own children.',
  '2026-01-31': 'The best version of yourself is already inside you — your kids are waiting to meet him.',
  '2026-02-01': 'Every morning you wake up and try again is an act of love your kids will one day understand.',
  '2026-02-02': 'Your values are not what you preach — they\'re what you do when no one is watching.',
  '2026-02-03': 'A dad who admits he was wrong raises children who aren\'t afraid to grow.',
  '2026-02-04': 'The effort you put in when no one notices is exactly what your kids will never forget.',
  '2026-02-05': 'Fatherhood is the longest, hardest, most rewarding project you\'ll ever take on.',
  '2026-02-06': 'You don\'t have to be the loudest person in the room to be the strongest presence in your family.',
  '2026-02-07': 'Every sacrifice you make in silence is a seed planted in your child\'s future.',
  '2026-02-08': 'The way you love their mother teaches your kids what love is supposed to look like.',
  '2026-02-09': 'Be patient with yourself — you\'re learning one of the hardest jobs in the world on the job.',
  '2026-02-10': 'Your kids are not an interruption to your life. They are the point of it.',
  '2026-02-11': 'A great dad isn\'t one who never fails — it\'s one who never stops getting back up.',
  '2026-02-12': 'What you build with your hands impresses people. What you build in your children changes the world.',
  '2026-02-13': 'Love is not just a feeling — it\'s the decision you make every single day to show up.',
  '2026-02-14': 'The best Valentine you\'ll ever give is choosing to be fully present with your family today.',
  '2026-02-15': 'Your children are your most important legacy — invest in them accordingly.',
  '2026-02-16': 'Tired is temporary. The memories you\'re creating right now are forever.',
  '2026-02-17': 'A dad who plays is a dad who never truly grows old.',
  '2026-02-18': 'Your child doesn\'t need you to be impressive — they need you to be real.',
  '2026-02-19': 'Every "I love you" you say builds a fortress around your child\'s heart.',
  '2026-02-20': 'You are not just raising a child — you are shaping a future adult who will shape the world.',
  '2026-02-21': 'The man you are at home is the only version of you that truly matters.',
  '2026-02-22': 'Hard seasons don\'t last. Your love for your kids does.',
  '2026-02-23': 'Give your children roots to stand on and wings to fly — then watch them soar.',
  '2026-02-24': 'The nights you stayed up, the mornings you pushed through — your kids will understand one day.',
  '2026-02-25': 'Being a great father isn\'t about grand gestures. It\'s about ten thousand small, consistent ones.',
  '2026-02-26': 'Your kids won\'t remember your job title. They\'ll remember the dad who showed up.',
  '2026-02-27': 'Patience today plants seeds of trust that will grow for a lifetime.',
  '2026-02-28': 'You made it through another month. That\'s not nothing — that\'s everything.',
  '2026-03-01': 'A new month, a new chance to be the dad you want to be. You\'ve got this.',
  '2026-03-02': 'Your kids are watching how you handle difficulty — show them what resilience looks like.',
  '2026-03-03': 'The small wins matter. Celebrate them. With your kids, every day is worth celebrating.',
  '2026-03-04': 'Be the steady hand in the storm — your calm is your family\'s anchor.',
  '2026-03-05': 'What you model today, your children will become tomorrow.',
  '2026-03-06': 'A dad who keeps learning is a dad who never stops growing.',
  '2026-03-07': 'Your presence is the most powerful parenting tool you will ever have.',
  '2026-03-08': 'The father you are today is the man your children will always believe you to be.',
  '2026-03-09': 'Every day you choose your family, you choose to leave a legacy worth remembering.',
};

const insertQuote = db.prepare('INSERT OR IGNORE INTO daily_quotes (date, quote) VALUES (?, ?)');
const seedQuotes = db.transaction(() => {
  for (const [date, quote] of Object.entries(HISTORICAL_QUOTES)) {
    insertQuote.run(date, quote);
  }
});
seedQuotes();

// Seed starter posts if empty
const postCount = (db.prepare('SELECT COUNT(*) as c FROM posts').get() as { c: number }).c;
if (postCount === 0) {
  const insert = db.prepare(
    'INSERT INTO posts (author, category, title, content, likes) VALUES (?, ?, ?, ?, ?)'
  );
  insert.run('DadOfThree', 'General', 'Welcome to Fathom!',
    `Hey everyone! 👋 This is the place for dads at every stage of the journey — newborns, toddlers, teens, you name it.\n\nShare your wins, your struggles, your hacks, and your questions. No judgement here. We're all figuring it out together.\n\nDrop a comment and introduce yourself — how many kids do you have and what's your biggest challenge right now?`, 24);
  insert.run('FirstTimeDad_Mike', 'Newborn & Baby', 'Swaddle technique that actually works — game changer',
    `My wife and I were struggling for weeks until a nurse showed us the "burrito wrap" method. Fold one corner down, place baby with shoulders at that fold, wrap one side tight, tuck the bottom up, then wrap the other side.\n\nKey thing nobody told us: it needs to be TIGHT. We were too gentle. Once we went firmer (safely), our son slept 3 extra hours. Sharing in case it helps anyone else!`, 18);
  insert.run('CoachDad', 'Teens', 'How do you talk to a teenager who shuts down?',
    `My 15-year-old used to tell me everything. Now I get one-word answers. I know it's normal but it still hurts.\n\nWhat's worked for other dads? I've tried car conversations (no eye contact helps), texting, doing activities together. Some days are better than others but I miss our connection.\n\nAny advice from dads who've been through this stage?`, 31);
  insert.run('WeekendDadSteve', 'Dad Hacks', '10-minute bedtime routine that actually works',
    `After years of 45-minute bedtime battles, here's what works for us:\n\n1. Bath (or wipe-down) — signals wind-down time\n2. Brush teeth together — they copy you\n3. ONE book, chosen by them\n4. Lights out, soft music, 2-minute back rub\n5. "See you in the morning" — walk out calmly\n\nThe key is consistency. Do it the same way every night and within 2 weeks it becomes automatic. No more negotiations!`, 42);
  insert.run('SingleDadPaul', 'Single Dads', 'Meal prep Sunday changed my life',
    `As a single dad of two, weeknight dinners were chaos. Someone told me to try batch cooking on Sunday and I resisted for months. Finally tried it and wow.\n\n3 hours Sunday = 5 easy weeknight dinners. Kids actually get involved now — my 8 year old loves portioning things into containers.\n\nAnyone else do this? What are your go-to batch cook meals?`, 29);
}

// ─── Quote history routes ─────────────────────────────────────────────────────

app.get('/api/quotes/history', (req, res) => {
  const quotes = db.prepare('SELECT * FROM daily_quotes ORDER BY date DESC').all();
  res.json(quotes);
});

app.get('/api/quotes/:date', (req, res) => {
  const quote = db.prepare('SELECT * FROM daily_quotes WHERE date = ?').get(req.params.date);
  if (!quote) return res.status(404).json({ error: 'No quote for this date' });
  res.json(quote);
});

// ─── Community API routes ─────────────────────────────────────────────────────

app.get('/api/posts', (req, res) => {
  const { category } = req.query;
  const sql = category && category !== 'All'
    ? `SELECT p.*, (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count FROM posts p WHERE p.category = ? ORDER BY p.created_at DESC`
    : `SELECT p.*, (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count FROM posts p ORDER BY p.created_at DESC`;
  const posts = category && category !== 'All'
    ? db.prepare(sql).all(category)
    : db.prepare(sql).all();
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const { author, category, title, content } = req.body;
  if (!author || !category || !title || !content) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const result = db.prepare(
    'INSERT INTO posts (author, category, title, content) VALUES (?, ?, ?, ?)'
  ).run(author.trim(), category, title.trim(), content.trim());
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.json(post);
});

app.get('/api/posts/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comments = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json({ ...post as object, comments });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const { author, content } = req.body;
  if (!author || !content) return res.status(400).json({ error: 'author and content required' });
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const result = db.prepare(
    'INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)'
  ).run(req.params.id, author.trim(), content.trim());
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  res.json(comment);
});

app.post('/api/posts/:id/like', (req, res) => {
  db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(req.params.id);
  const post = db.prepare('SELECT likes FROM posts WHERE id = ?').get(req.params.id) as { likes: number };
  res.json({ likes: post.likes });
});

// ─── Claude AI routes ─────────────────────────────────────────────────────────

app.post('/api/motivation', async (req, res) => {
  try {
    const stream = claude.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 200,
      messages: [{ role: 'user', content: 'Give me a powerful, one-sentence motivational message for a father today. Something that hits deep but stays positive. No quotes around it.' }],
    });
    res.setHeader('Content-Type', 'text/plain');
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') res.write(event.delta.text);
    }
    res.end();
  } catch {
    res.status(500).json({ error: 'Failed to generate motivation' });
  }
});

app.post('/api/tip', async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'category required' });
  try {
    const stream = claude.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: `Generate a short, practical, and highly motivating parenting tip for a dad. Category: ${category}. Be encouraging, realistic, and actionable. Format in Markdown.` }],
    });
    res.setHeader('Content-Type', 'text/plain');
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') res.write(event.delta.text);
    }
    res.end();
  } catch {
    res.status(500).json({ error: 'Failed to generate tip' });
  }
});

app.post('/api/idea', async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'category required' });
  try {
    const stream = claude.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: `Generate a detailed, fun weekend project idea for a dad and kids in the category: "${category}". Include: project name, materials needed, 3-5 step instructions, and a bonding tip. Format in Markdown.` }],
    });
    res.setHeader('Content-Type', 'text/plain');
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') res.write(event.delta.text);
    }
    res.end();
  } catch {
    res.status(500).json({ error: 'Failed to generate idea' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Fathom API running on http://localhost:${PORT}`));
