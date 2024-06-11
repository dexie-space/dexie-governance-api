import { Context } from 'hono';

export async function getProposals(c: Context) {
  const proposals = await c.env.DB.prepare(
    `select *, hash as id,
     (select json_group_array(json_object('id', id, 'choice', choice, 'amount',
      ifnull((select sum(amount) / 1000.0 from gov_votes where choice = gov_choices.id and proposal_id = gov_proposals.id), 0)))
      from gov_choices WHERE proposal_id = gov_proposals.id order by id) as results
    from gov_proposals order by id`
  ).all();

  // parse results
  proposals.results = proposals.results.map((p: any) => {
    p.results = JSON.parse(p.results);
    return p;
  });

  return c.json({ success: true, proposals: proposals.results });
}
