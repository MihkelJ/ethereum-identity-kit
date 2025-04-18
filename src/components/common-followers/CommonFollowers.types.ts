import { Address, ProfileListType } from '../../types'

export type CommonFollowersProps = {
  connectedAddress: Address
  lookupAddressOrName: Address | string
  displayEmpty?: boolean
  onProfileClick?: (address: Address) => void
  hasModal?: boolean
  darkMode?: boolean
  selectedList?: ProfileListType
}
