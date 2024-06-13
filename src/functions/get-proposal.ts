import { Context } from 'hono';
import { FormattedProposal, Proposal } from '../types/proposal';

export function formatProposal(proposal: Proposal): FormattedProposal {
  // using hash as id for the public facing part
  // this allows us to use primary key integers internally in sqlite
  const formatted: FormattedProposal = {
    id: proposal.hash,
    title: proposal.title,
    start_height: proposal.start_height,
    end_height: proposal.end_height,
    date_created: proposal.date_created,
    content: proposal.content,
    discussion_link: proposal.discussion_link,
    deployer_pubkey: proposal.deployer_pubkey,
    deployer_sig: proposal.deployer_sig,
    choices: proposal.choices,
    votes: proposal.votes,
  };

  return formatted;
}

export async function getProposal(c: Context, id_or_hash: any): Promise<Proposal | null> {
  const proposal = await c.env.DB.prepare(
    `select id, title, content, hash, start_height, end_height, discussion_link, date_created,
    lower(hex(deployer_pubkey)) AS deployer_pubkey, lower(hex(deployer_signature)) AS deployer_sig,
    (select json_group_array(json_object('id', id, 'choice', choice))
      from gov_choices WHERE proposal_id = gov_proposals.id order by id) as choices
    from gov_proposals
    where id = ? OR hash = ?`
  )
    .bind(id_or_hash, id_or_hash)
    .first();

  if (!proposal) return null;

  // parse choices
  proposal.choices = JSON.parse(proposal.choices).sort((a: any, b: any) => a.id - b.id);

  const votes = await c.env.DB.prepare(
    `select lower(hex(ph)) as ph,
    amount / 1000.0 as amount,
    choice,
    case when signature is null then null else lower(hex(signature)) end AS sig,
    case when pubkey is null then null else lower(hex(pubkey)) end AS pubkey
    from gov_votes where proposal_id = ? order by amount desc`
  )
    .bind(proposal.id)
    .all();

  proposal.date_created = new Date(proposal.date_created).toJSON();

  return { ...proposal, votes: votes.results };
}
