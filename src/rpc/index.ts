import { Context } from 'hono';
import { BlockRecord, InitializedBlockchainState, UninitializedBlockchainState } from '../types/blockchain';

export interface RpcResponse {
  success: boolean;
  error?: string;
}

export async function request<T>(c: Context, route: string, body: Record<string, unknown>): Promise<T> {
  const req = {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  };

  const response = await fetch(`${c.env.FULLNODE_RPC}${route}`, req);

  return response.json() as Promise<T>;
}

export interface GetBlockchainStateResponse extends RpcResponse {
  blockchain_state: UninitializedBlockchainState | InitializedBlockchainState;
}

export async function get_blockchain_state(c: Context): Promise<GetBlockchainStateResponse> {
  return request<GetBlockchainStateResponse>(c, '/get_blockchain_state', {});
}

export interface GetBlockRecordByHeightResponse extends RpcResponse {
  block_record: BlockRecord;
}

export async function get_block_record_by_height(c: Context, height: number): Promise<GetBlockRecordByHeightResponse> {
  return request<GetBlockRecordByHeightResponse>(c, '/get_block_record_by_height', {
    height,
  });
}
