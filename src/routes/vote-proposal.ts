import { Context } from 'hono';
import { get_blockchain_state } from '../rpc';
import { verifySignature } from '../functions/verify-signature';

export async function voteProposal(c: Context) {
  let { choice, signature, pubkey, ph } = await c.req.json();

  // some wallets send values 0x prefixed, take care of it
  signature = signature?.replace('0x', '');
  pubkey = pubkey?.replace('0x', '');
  ph = ph?.replace('0x', '');

  const proposal = c.get('proposal');

  if (!proposal.choices.find((c: any) => c.id === choice)) {
    return c.json({ success: false, error: 'Invalid choice' });
  }

  const state = await get_blockchain_state(c);

  if (!state?.blockchain_state?.peak?.height) {
    return c.json({ success: false, error: 'Failed to get blockchain state' }, 500);
  }

  if (proposal.end_height < state.blockchain_state.peak.height) {
    return c.json({ success: false, error: 'Vote time has expired' });
  }

  const vote = proposal.votes.find((c: any) => c.ph === ph);

  if (!vote || !ph) {
    return c.json({ success: false, error: 'Address not eligible to vote on this proposal' }, 400);
  }

  if (vote.choice !== null) {
    return c.json({ success: false, error: 'Address has already voted on this proposal' }, 400);
  }

  // message to sign
  const message = JSON.stringify({ space: c.env.NAMESPACE, type: 'vote', proposal: proposal.hash, choice: choice });

  if (!verifySignature(pubkey, message, signature, vote.ph)) {
    return c.json({ success: false, error: 'Failed to verify signature' }, 400);
  }

  // add vote
  await c.env.DB.prepare(`update gov_votes set choice = ?, signature = unhex(?), pubkey = unhex(?) where proposal_id = ? and ph = unhex(?)`)
    .bind(choice, signature, pubkey, proposal.id, vote.ph)
    .run();

  // get updated vote
  const updated_vote = await c.env.DB.prepare(
    `select lower(hex(ph)) as ph,
    amount / 1000.0 as amount,
    choice,
    lower(hex(signature)) AS sig,
    lower(hex(pubkey)) AS pubkey
    from gov_votes where proposal_id = ? and ph = unhex(?)`
  )
    .bind(proposal.id, vote.ph)
    .first();

  return c.json({ success: true, vote: updated_vote });
}
