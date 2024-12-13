import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Address } from '../types/address'
import { fetchProfileDetails } from '../utils/api/fetch-profile-details'
import { ProfileDetailsResponse } from '../types/profile'
import { ProfileListType } from '../types/profile'
interface UseProfileDetailsProps {
  addressOrName: Address | string
  list?: ProfileListType
  prefetchedData?: ProfileDetailsResponse
  refetchPrefetchedData?: () => void
}

export const useProfileDetails = ({
  addressOrName,
  list,
  prefetchedData,
  refetchPrefetchedData,
}: UseProfileDetailsProps) => {
  const [fetchFreshProfileDetails, setFetchFreshProfileDetails] = useState(false)
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['profile', addressOrName, list, fetchFreshProfileDetails],
    queryFn: async () => prefetchedData || (await fetchProfileDetails(addressOrName, list, fetchFreshProfileDetails)),
  })

  const refreshProfileDetails = () => {
    if (isRefetching) return

    if (refetchPrefetchedData) return refetchPrefetchedData()

    if (fetchFreshProfileDetails) refetch()
    else setFetchFreshProfileDetails(true)
  }

  const address = data?.address
  const primaryList = data?.primary_list
  const ens = data?.ens
  const ranks = data?.ranks
  const detailsLoading = isLoading || isRefetching

  return {
    ens,
    ranks,
    address,
    primaryList,
    detailsLoading,
    refreshProfileDetails,
  }
}
