import { Context } from 'hono';
import { formatProposal, getProposal } from '../functions/get-proposal';
import { sha256 } from 'hono/utils/crypto';
import { get_block_record_by_height } from '../rpc';
import { verifySignature } from '../functions/verify-signature';

export async function createProposal(c: Context) {
  const { title, choices, content, holders, start_height, end_height, discussion_link, pubkey, signature } = await c.req.json();

  if (!title || !choices || !content || !holders || !start_height || !end_height || !pubkey || !signature) {
    return c.json({ success: false, error: 'One or more required fields are missing' }, 400);
  }

  try {
    const record = await get_block_record_by_height(c, start_height);

    if (!record?.block_record?.timestamp) {
      return c.json({ success: false, error: 'Failed to get start height or start height is not a tx block' }, 400);
    }

    // proposal hash consists of title, content, choices, start height, end height
    const hash = (await sha256(JSON.stringify({ space: c.env.NAMESPACE, content, choices, start_height, end_height }))) as string;

    if (!verifySignature(pubkey, hash, signature)) {
      return c.json({ success: false, error: 'Failed to verify signature' }, 400);
    }

    // check if is pubkey is part of team
    if (!c.env.TEAM_PUBKEYS.includes(pubkey)) {
      return c.json({ success: false, error: 'Pubkey is not part of team' }, 400);
    }

    // create proposal
    const { meta } = await c.env.DB.prepare(
      `insert into gov_proposals
      (title, content, hash, start_height, end_height, discussion_link, date_created, deployer_pubkey, deployer_signature)
      values
      (?, ?, ?, ?, ?, ?, datetime(?, 'unixepoch'), unhex(?), unhex(?))`
    )
      .bind(title, content, hash, start_height, end_height, discussion_link, record.block_record.timestamp, pubkey, signature)
      .run();

    // add choices
    for (const [index, choice] of choices.entries()) {
      await c.env.DB.prepare(`insert into gov_choices (proposal_id, id, choice) values (?, ?, ?)`)
        .bind(meta.last_row_id, index, choice)
        .run();
    }

    // add token holders
    const add_holder_stmt = c.env.DB.prepare(`insert into gov_votes (proposal_id, ph, amount) values (?, unhex(?), ?)`);

    await c.env.DB.batch(holders.map((holder: any) => add_holder_stmt.bind(meta.last_row_id, holder.ph, holder.amount)));

    const proposal = await getProposal(c, meta.last_row_id);

    // verify that holders count matches
    if (!proposal || proposal.votes.length !== holders.length) {
      // TODO: clear the proposal and choices (d1 does not support transactions yet)
      throw new Error('Failed to create proposal, voter count mismatch');
    }

    return c.json({ success: true, proposal: formatProposal(proposal) });
  } catch (e) {
    console.error(e);
    return c.json({ success: false, error: 'Failed to create proposal' }, 500);
  }
}
