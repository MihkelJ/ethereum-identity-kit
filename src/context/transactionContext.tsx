import {
  Dispatch,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  type ReactNode,
  SetStateAction,
} from 'react'
import { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMintTxChainId, getMintTxNonce, getPendingTxAddresses, prepareMintTransaction } from '../utils/transactions'
import { generateSlot } from '../utils/generate-slot'
import { fetchProfileLists } from '../utils/api/fetch-profile-lists'
import { getListStorageLocation } from '../utils/list-storage-location'
import { EFPActionType } from '../types/transactions'
import { TransactionType } from '../types/transactions'
import { ProfileListsResponse } from '../types'
import { LIST_OP_LIMITS } from '../constants/chains'
import { EFPActionIds } from '../constants/transactions'

type TransactionContextType = {
  txModalOpen: boolean
  batchTransactions: boolean
  setTxModalOpen: (txModalOpen: boolean) => void
  changesOpen: boolean
  setChangesOpen: (changesOpen: boolean) => void
  selectedList?: string
  setSelectedList: (selectedList: string | undefined) => void
  pendingTxs: TransactionType[]
  setPendingTxs: Dispatch<SetStateAction<TransactionType[]>>
  lists?: ProfileListsResponse | null
  listsLoading: boolean
  nonce: bigint | undefined
  addTransactions: (txs: TransactionType[]) => void
  addListOpsTransaction: (tx: TransactionType) => void
  removeTransactions: (ids: (EFPActionType | string)[]) => void
  removeListOpsTransaction: (txData: Hex[]) => void
  currentTxIndex: number | undefined
  setCurrentTxIndex: (currentTxIndex: number | undefined) => void
  goToNextTransaction: () => void
  resetTransactions: () => void
  selectedChainId: number | undefined
  setSelectedChainId: (chainId: number | undefined) => void
  onCheckoutFinish: (() => void) | undefined
  setOnCheckoutFinish: (onCheckoutFinish: (() => void) | undefined) => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export const TransactionProvider = ({
  batchTransactions,
  children,
}: {
  batchTransactions: boolean
  children: ReactNode
}) => {
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [pendingTxs, setPendingTxs] = useState<TransactionType[]>([])
  const [currentTxIndex, setCurrentTxIndex] = useState<number | undefined>(undefined)
  const [changesOpen, setChangesOpen] = useState(batchTransactions && !currentTxIndex)

  const [selectedList, setSelectedList] = useState<string | undefined>(undefined)
  const [onCheckoutFinish, setOnCheckoutFinish] = useState<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (!txModalOpen) {
      const includesUpdateEFPList = pendingTxs.some((tx) => tx.id === EFPActionIds.UpdateEFPList)
      if (includesUpdateEFPList || pendingTxs.length === 0)
        setChangesOpen(batchTransactions && !currentTxIndex && pendingTxs[0]?.hash === undefined)
      if ((!currentTxIndex || currentTxIndex === 0) && pendingTxs[0]?.hash === undefined) setCurrentTxIndex(undefined)
    }
  }, [txModalOpen])

  const [listDetailsLoading, setListDetailsLoading] = useState(false)
  const [nonce, setNonce] = useState<bigint | undefined>(undefined)
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>(undefined)

  const { address: connectedAddress } = useAccount()
  const {
    data: lists,
    isLoading: listsLoading,
    refetch: refetchLists,
    isRefetching: listsIsRefetching,
  } = useQuery({
    queryKey: ['lists', connectedAddress],
    queryFn: async () => {
      if (!connectedAddress) return null

      const fetchedLists = await fetchProfileLists(connectedAddress, true)
      return fetchedLists
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  const getListDetails = async () => {
    if (selectedList === 'new list' || !lists?.primary_list) {
      setSelectedChainId(undefined)
      setNonce(undefined)
    } else {
      const { chainId, slot } = await getListStorageLocation(selectedList ?? lists?.primary_list)
      setSelectedChainId(chainId)
      setNonce(slot)
    }

    setListDetailsLoading(false)
  }

  // Load connected user's details and existing pending transactions
  useEffect(() => {
    setListDetailsLoading(true)

    const storedPendingTxs = JSON.parse(
      localStorage.getItem(`eik-pending-txs-${connectedAddress}-${selectedList || lists?.primary_list || 'null'}`) ||
      '[]'
    ) as TransactionType[]

    if (storedPendingTxs && storedPendingTxs.length > 0) {
      // Find the mint transaction and extract the nonce and chainId
      const mintTx = storedPendingTxs.find((tx) => tx.id === EFPActionIds.CreateEFPList)

      if (mintTx) {
        const storedNonce = getMintTxNonce(mintTx)
        const storedChainId = getMintTxChainId(mintTx)

        if (storedNonce !== nonce) setNonce(storedNonce)
        if (storedChainId !== selectedChainId) setSelectedChainId(storedChainId)
        setListDetailsLoading(false)
      } else {
        getListDetails()
      }

      // Find the index of the first incomplete transaction to set it as the current transaction
      const incompleteTxIndex = storedPendingTxs.findIndex((tx) => !tx.hash)
      const txIndex = incompleteTxIndex === -1 ? storedPendingTxs.length - 1 : incompleteTxIndex

      setPendingTxs(storedPendingTxs)
      setCurrentTxIndex(txIndex === 0 ? undefined : txIndex)
      setChangesOpen(batchTransactions && incompleteTxIndex === 0)
      if (!batchTransactions || (txIndex > 0 && txIndex === storedPendingTxs.length - 1)) setTxModalOpen(true)
    } else {
      getListDetails()
      setPendingTxs([])
      setTxModalOpen(false)
      setCurrentTxIndex(undefined)
    }
  }, [connectedAddress, lists?.primary_list, selectedList])

  // Save pending transactions to local storage
  useEffect(() => {
    if (!connectedAddress) return

    if (pendingTxs.length === 0) {
      localStorage.removeItem(`eik-pending-txs-${connectedAddress}-${selectedList || lists?.primary_list || 'null'}`)
      return
    }

    // const transformPendingTxs = transformTxsForLocalStorage(pendingTxs)
    localStorage.setItem(
      `eik-pending-txs-${connectedAddress}-${selectedList || lists?.primary_list || 'null'}`,
      JSON.stringify(pendingTxs, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
    )
  }, [pendingTxs])

  const addTransactions = (txs: TransactionType[]) => {
    const newPendingTxs = batchTransactions ? [...pendingTxs, ...txs] : txs
    setPendingTxs(newPendingTxs)
  }

  const addListOpsTransaction = (tx: TransactionType) => {
    const newPendingTxs = batchTransactions ? [...pendingTxs] : []

    // Add new transaction and mint if user has no list and there is no pending transaction
    if (newPendingTxs.length === 0 || !batchTransactions) {
      newPendingTxs.push(tx)

      if (selectedList === 'new list' || (!selectedList && !lists?.primary_list)) {
        const mintNonce = nonce || generateSlot()

        if (mintNonce !== nonce) {
          setNonce(mintNonce)
          newPendingTxs[0].args[0] = mintNonce
        }

        const mintTransaction = prepareMintTransaction(mintNonce)

        newPendingTxs.push(mintTransaction)
      }
    } else if (batchTransactions) {
      // Update the UpdateEFPList transaction if it exists and is not yet complete
      const pendingUpdateTransactionId = newPendingTxs
        .reverse()
        .findIndex((tx) => tx.id === EFPActionIds.UpdateEFPList && !tx.hash)

      if (pendingUpdateTransactionId === -1) {
        newPendingTxs.push(tx)
      } else {
        const pendingUpdateTxListOps = newPendingTxs[pendingUpdateTransactionId].args.slice(-1).flat()
        const txListOps = tx.args.slice(-1).flat()

        if (pendingUpdateTxListOps.length >= LIST_OP_LIMITS[tx.chainId as keyof typeof LIST_OP_LIMITS]) {
          newPendingTxs.push(tx)
        } else if (!pendingUpdateTxListOps.includes(txListOps[0])) {
          newPendingTxs[pendingUpdateTransactionId] = {
            ...newPendingTxs[pendingUpdateTransactionId],
            args: [
              ...newPendingTxs[pendingUpdateTransactionId].args.slice(0, -1),
              [...pendingUpdateTxListOps, ...txListOps],
            ],
          }
        }
      }
    }

    setPendingTxs(newPendingTxs)
    if (!batchTransactions) setTxModalOpen(true)
  }

  const removeTransactions = (ids: (EFPActionType | string)[]) => {
    const filteredPendingTxs = pendingTxs.filter((tx) => !ids.includes(tx.id))
    setPendingTxs(filteredPendingTxs)
  }

  const removeListOpsTransaction = (txData: Hex[]) => {
    const filteredPendingTxs = pendingTxs
      .filter((tx) => tx.id === EFPActionIds.UpdateEFPList && !tx.hash)
      .map((tx) => {
        const filteredArgs = tx.args
          .slice(-1)
          .flat()
          .filter((data: Hex) => !txData.map((op) => op.slice(2).toLowerCase()).includes(data.slice(10).toLowerCase()))

        return {
          ...tx,
          // Only change the last argument that represents the list ops
          args: [...tx.args.slice(0, -1), filteredArgs],
        }
      })

    const pendingTxAddresses = getPendingTxAddresses(filteredPendingTxs)

    if (pendingTxAddresses.length === 0) {
      resetTransactions()
    } else {
      setPendingTxs(filteredPendingTxs)
    }
  }

  const queryClient = useQueryClient()
  const goToNextTransaction = () => {
    const newTxIndex = (currentTxIndex || 0) + 1
    if (newTxIndex === pendingTxs.length) {
      // Refetch lists if user has minted a new one
      if (pendingTxs.find((tx) => tx.id === EFPActionIds.CreateEFPList)) refetchLists()
      resetTransactions()

      // Refetch follow button data
      queryClient.invalidateQueries({ queryKey: ['followingState'] })

      // custom callback to run when transactions are finished (update profile, stats, etc.)
      onCheckoutFinish?.()
    } else {
      setCurrentTxIndex(newTxIndex)
    }
  }

  const resetTransactions = useCallback(() => {
    setTxModalOpen(false)
    setPendingTxs([])
    setCurrentTxIndex(undefined)
  }, [])

  const value = {
    lists,
    nonce,
    selectedList,
    setSelectedList,
    pendingTxs,
    txModalOpen,
    changesOpen,
    setPendingTxs,
    setChangesOpen,
    setTxModalOpen,
    addTransactions,
    addListOpsTransaction,
    currentTxIndex,
    selectedChainId,
    removeTransactions,
    removeListOpsTransaction,
    batchTransactions,
    resetTransactions,
    setCurrentTxIndex,
    setSelectedChainId,
    goToNextTransaction,
    onCheckoutFinish,
    setOnCheckoutFinish,
    listsLoading: listsLoading || listsIsRefetching || listDetailsLoading,
  }

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
}

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransactions must be used within an TransactionProvider')
  }
  return context
}
