import { CommonFollowersResponse } from '../types'

export const EFP_API_URL = 'https://api.ethfollow.xyz/api/v1'
export const DEFAULT_FALLBACK_AVATAR = 'https://efp.app/assets/art/default-avatar.svg'
export const DEFAULT_FALLBACK_HEADER = 'https://efp.app/assets/art/default-header.svg'

export const DEFAULT_LOADING_GRADIENT =
  'linear-gradient(90deg, rgba(200, 200, 200, 0.7) 0%, rgba(172, 172, 172, 0.05) 50%, rgba(200, 200, 200, 0.7) 100%)'
export const LIGHT_LOADING_GRADIENT =
  'linear-gradient(90deg, rgba(212, 212, 212, 0.9) 0%, rgba(132, 132, 132, 0.2) 50%, rgba(212, 212, 212, 0.9) 100%)'

export const THEMES = ['light', 'dark'] as const

export const noCommonFollowers = {
  results: [],
  length: 0,
} satisfies CommonFollowersResponse

export * from './socials'
