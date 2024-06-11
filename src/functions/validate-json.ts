import { Context, Next } from 'hono';

export async function validateJSON(c: Context, next: Next) {
  if (c.req.method === 'POST') {
    try {
      await c.req.json();
    } catch {
      return c.json({ success: false, error: 'Invalid JSON' }, 400);
    }
  }

  await next();
}
