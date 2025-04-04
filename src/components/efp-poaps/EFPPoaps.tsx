import React from 'react'
import { EFPPoapsProps } from './EFPPoaps.types'
import LoadingCell from '../loading-cell/LoadingCell'
import { useEFPPoaps } from '../../hooks/useEFPPoaps'
import './EFPPoaps.css'

const EFPPoaps: React.FC<EFPPoapsProps> = ({ list, addressOrName, isLoading, style }) => {
  const { ownedBadges, isLoading: isBadgesLoading } = useEFPPoaps({
    addressOrName: addressOrName || undefined,
    list: list || undefined,
  })

  if (!isBadgesLoading && ownedBadges.length === 0) return null

  return (
    <div className="efp-poaps-container" style={style}>
      {isBadgesLoading || isLoading ? (
        <>
          <LoadingCell className="h-[72px] w-[72px] rounded-full" />
          <LoadingCell className="h-[72px] w-[72px] rounded-full" />
        </>
      ) : (
        ownedBadges.map((badge) => (
          <a
            href={`https://collectors.poap.xyz/token/${badge.collection?.tokenId || ''}`}
            key={badge.collection?.tokenId}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={badge.collection?.event?.image_url || ''}
              alt={badge.collection?.event?.name || ''}
              className="efp-poaps-poap-image"
            />
          </a>
        ))
      )}
    </div>
  )
}

export default EFPPoaps
