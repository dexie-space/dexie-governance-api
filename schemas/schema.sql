DROP TABLE IF EXISTS gov_proposals;
CREATE TABLE IF NOT EXISTS gov_proposals (
  id integer PRIMARY KEY AUTOINCREMENT,
  title text NOT NULL,
  content text NOT NULL,
  discussion_link text,
  hash text NOT NULL,
  start_height integer NOT NULL,
  end_height integer NOT NULL,
  date_created datetime NOT NULL,
  deployer_pubkey binary NOT NULL,
  deployer_signature binary NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS gov_proposals_hash ON gov_proposals (hash);

DROP TABLE IF EXISTS gov_choices;
CREATE TABLE IF NOT EXISTS gov_choices (
  proposal_id integer NOT NULL,
  id integer NOT NULL,
  choice text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS gov_choices_proposal_id_choice ON gov_choices (proposal_id, choice);

DROP TABLE IF EXISTS gov_votes;
CREATE TABLE IF NOT EXISTS gov_votes (
  proposal_id integer NOT NULL,
  ph binary NOT NULL,
  amount integer NOT NULL,
  choice integer,
  pubkey binary,
  signature binary
);

CREATE UNIQUE INDEX IF NOT EXISTS gov_votes_proposal_id_ph ON gov_votes (proposal_id, ph);