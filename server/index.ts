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

// Seed starter posts if empty
const postCount = (db.prepare('SELECT COUNT(*) as c FROM posts').get() as { c: number }).c;
if (postCount === 0) {
  const insert = db.prepare(
    'INSERT INTO posts (author, category, title, content, likes) VALUES (?, ?, ?, ?, ?)'
  );
  insert.run('DadOfThree', 'General', 'Welcome to the DadVantage Community!',
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
app.listen(PORT, () => console.log(`DadVantage API running on http://localhost:${PORT}`));
