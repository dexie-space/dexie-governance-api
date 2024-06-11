import { Hono } from 'hono';
import { createProposal } from './routes/create-proposal';
import { proposalMiddleware } from './functions/proposal-middleware';
import { voteProposal } from './routes/vote-proposal';
import { Proposal } from './types/proposal';
import { validateJSON } from './functions/validate-json';
import { getProposals } from './routes/get-proposals';
import { getProposal } from './routes/get-proposal';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
  Variables: { proposal: Proposal };
}>();

app.use(validateJSON);

app.get('/v1/gov/proposals', getProposals);
app.post('/v1/gov/proposals', createProposal);

app.use('/v1/gov/proposals/:id/*', proposalMiddleware);
app.get('/v1/gov/proposals/:id', getProposal);
app.post('/v1/gov/proposals/:id/vote', voteProposal);

export default app;
