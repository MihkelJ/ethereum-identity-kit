import { Address, Abi, Hex } from 'viem'

export enum EFPActionType {
  CreateEFPList = 'CreateEFPList',
  UpdateEFPList = 'UpdateEFPList',
}

export type TransactionType = {
  title?: string
  description?: string
  id: EFPActionType | string
  address: Address
  chainId?: number
  abi: Abi
  functionName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[]
  hash?: Hex
}

export type SubmitButtonText =
  | 'Switch Chain'
  | 'Initiate'
  | 'Pending...'
  | 'Re-Initiate'
  | 'Indexing...'
  | 'Finish'
  | 'Next'

export type ListOpType = {
  opcode: number
  data: Hex
}

export type GetListOpsTransactionProps = {
  nonce?: bigint
  chainId?: number
  listOps: ListOpType[]
  connectedAddress: Address
}
