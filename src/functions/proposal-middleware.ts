import { Context, Next } from 'hono';
import { getProposal } from './get-proposal';

export async function proposalMiddleware(c: Context, next: Next) {
  const { id } = c.req.param();

  const proposal = await getProposal(c, id);

  if (proposal === null) {
    return c.json({ success: false, error: 'Unknown proposal' }, 404);
  }

  c.set('proposal', proposal);

  await next();
}
