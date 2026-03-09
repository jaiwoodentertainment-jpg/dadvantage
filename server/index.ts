import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const app = express();
app.use(express.json());

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Daily motivational quote for dads
app.post('/api/motivation', async (req, res) => {
  try {
    const stream = claude.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: 'Give me a powerful, one-sentence motivational message for a father today. Something that hits deep but stays positive. No quotes around it.',
      }],
    });

    res.setHeader('Content-Type', 'text/plain');
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate motivation' });
  }
});

// Parenting tip by category
app.post('/api/tip', async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'category required' });

  try {
    const stream = claude.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Generate a short, practical, and highly motivating parenting tip or life message for a dad. The category is: ${category}. Focus on being encouraging, realistic, and actionable. Format the response in Markdown.`,
      }],
    });

    res.setHeader('Content-Type', 'text/plain');
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate tip' });
  }
});

// Weekend project idea by category
app.post('/api/idea', async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'category required' });

  try {
    const stream = claude.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Generate a detailed, fun weekend project idea for a dad and his kids in the category: "${category}".
Include:
- A creative project name
- What you'll need (materials/ingredients)
- Simple step-by-step instructions (3-5 steps)
- A bonding tip at the end
Keep it realistic, achievable in a weekend, and genuinely fun for both dads and kids. Format in Markdown.`,
      }],
    });

    res.setHeader('Content-Type', 'text/plain');
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate idea' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`DadVantage API server running on http://localhost:${PORT}`);
});
