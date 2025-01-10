import { StoryFn, Meta } from '@storybook/react'
import { useAccount, useConnect, useDisconnect, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FollowButton from './FollowButton'
import { config } from '../../constants/wagmi'
import { FollowButtonProps } from './FollowButton.types'
import TransactionModal from '../transaction-modal/TransactionModal'
import { TransactionProvider } from '../../context/transactionContext'

const queryClient = new QueryClient()

const FollowButtonWrapper = (args: FollowButtonProps) => {
  const { address: connectedAddress } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div
      style={{
        height: '50vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
        {connectedAddress ? (
          <div>
            <p>Connected to {connectedAddress}</p>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: '1px solid #000',
                cursor: 'pointer',
                margin: '0 auto',
              }}
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold', padding: '0', margin: '0' }}>
              Connect to a wallet to follow
            </p>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: '1px solid #000',
                  cursor: 'pointer',
                }}
              >
                {connector.icon && (
                  <img src={connector.icon} alt={connector.name} style={{ width: '20px', height: '20px' }} />
                )}
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <FollowButton
        lookupAddress={args.lookupAddress}
        connectedAddress={connectedAddress || args.connectedAddress}
        disabled={!connectedAddress}
      />
    </div>
  )
}

export default {
  title: 'Molecules/Follow Button',
  component: FollowButtonWrapper,
  decorators: [
    (Story) => (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TransactionProvider>
            <TransactionModal />
            {Story()}
          </TransactionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    ),
  ],
} as Meta<typeof FollowButtonWrapper>

const Template: StoryFn<typeof FollowButtonWrapper> = (args) => <FollowButtonWrapper {...args} />

export const FollowButtonByAddress = Template.bind({})
FollowButtonByAddress.args = {
  lookupAddress: '0x983110309620d911731ac0932219af06091b6744',
}
