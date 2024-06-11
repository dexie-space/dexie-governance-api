export interface Vote {
  ph: string;
  amount: number;
  choice: number | null;
  sig: string | null;
  pubkey: string | null;
}

export interface Proposal {
  id: number;
  hash: string;
  title: string;
  content: string;
  discussion_link: string;
  start_height: number;
  end_height: number;
  date_created: Date;
  choices: { id: number; choice: string }[];
  votes: Vote[];
}

export interface FormattedProposal {
  id: string;
  title: string;
  content: string;
  discussion_link: string;
  start_height: number;
  end_height: number;
  date_created: Date;
  choices: { id: number; choice: string }[];
  votes: Vote[];
}
