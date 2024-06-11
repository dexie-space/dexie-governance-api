import { Context } from 'hono';
import { formatProposal } from '../functions/get-proposal';

export async function getProposal(c: Context) {
  const proposal = c.get('proposal');

  return c.json({ success: true, proposal: formatProposal(proposal) });
}
