/**
 * wagmi configuration — Arc Mainnet
 */

import { http, fallback, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'

export const arcMainnet = defineChain({
  id: 5042,
  name: 'Arc Mainnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.arc.io'] },
    public: { http: ['https://rpc.mainnet.arc.io'] },
  },
  blockExplorers: {
    default: { name: 'Arcscan', url: 'https://explorer.arc.io' },
  },
})

registerChain(arcMainnet.id, '/rpc')

const arcMainnetTransport = fallback([
  http('https://rpc.mainnet.arc.io'),
  http('/rpc'),
])

export const config = createConfig({
  chains: [arcMainnet, mainnet],
  connectors: [injected()],
  transports: {
    [arcMainnet.id]: arcMainnetTransport,
    [mainnet.id]: http(),
  },
})