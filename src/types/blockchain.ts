export interface ClassgroupElement {
  data: string;
}

export interface SubEpochSummary {
  prev_subepoch_summary_hash: string;
  reward_chain_hash: string;
  num_blocks_overflow: number;
  new_difficulty: number | null;
  new_sub_slot_iters: number | null;
}

export interface BlockRecord {
  header_hash: string;
  prev_hash: string;
  height: number;
  weight: number;
  total_iters: number;
  signage_point_index: number;
  challenge_vdf_output: ClassgroupElement;
  infused_challenge_vdf_output: ClassgroupElement | null;
  reward_infusion_new_challenge: string;
  challenge_block_info_hash: string;
  sub_slot_iters: number;
  pool_puzzle_hash: string;
  farmer_puzzle_hash: string;
  required_iters: number;
  deficit: number;
  overflow: boolean;
  prev_transaction_block_height: number;
  timestamp: number | null;
  prev_transaction_block_hash: string | null;
  fees: number | null;
  finished_challenge_slot_hashes: string[] | null;
  finished_infused_challenge_slot_hashes: string[] | null;
  finished_reward_slot_hashes: string[] | null;
  sub_epoch_summary_included: SubEpochSummary | null;
}

export interface UninitializedBlockchainState {
  peak: null;
  genesis_challenge_initialized: false;
  sync: {
    sync_mode: false;
    synced: false;
    sync_tip_height: number;
    sync_progress_height: number;
  };
  difficulty: number;
  sub_slot_iters: number;
  space: number;
  mempool_size: number;
  mempool_min_fees: {
    cost_5000000: number;
    current_fee_rate: number;
    min_fpc: number;
  };
  last_update: Date;
}

export interface InitializedBlockchainState {
  peak: BlockRecord | null;
  genesis_challenge_initialized: true;
  difficulty: number;
  sub_slot_iters: number;
  space: number;
  mempool_size: number;
  mempool_fees: number;
  mempool_cost: number;
  mempool_min_fees: {
    cost_5000000: number;
    current_fee_rate: number;
    min_fpc: number;
  };
  sync: {
    sync_mode: boolean;
    synced: boolean;
    sync_tip_height: number;
    sync_progress_height: number;
  };
  last_update: Date;
}
