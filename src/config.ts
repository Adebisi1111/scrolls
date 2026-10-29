/**
 * wagmi configuration
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, fallback, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { arcTestnet as _arcTestnet } from 'viem/chains'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'
import { ARC_GOOD_RPC } from './useRepairChain'

// Live Arc Testnet RPCs. The public thirdweb endpoint sends
// `Access-Control-Allow-Origin: *` so browser fetches work; `/rpc` is the
// backend proxy fallback (same-origin, always up when the backend runs).
const ARC_PUBLIC_RPCS = [
  ARC_GOOD_RPC, // https://arc-testnet.rpc.thirdweb.com
  '/rpc',
]

// Override rpcUrls so wallet_addEthereumChain sends a working RPC to MetaMask.
export const arcTestnet = {
  ..._arcTestnet,
  rpcUrls: {
    default: { http: ARC_PUBLIC_RPCS },
    public: { http: ARC_PUBLIC_RPCS },
  },
} as const

registerChain(arcTestnet.id, '/rpc')

console.log('[Scrolls] wagmi primary RPC:', ARC_PUBLIC_RPCS[0])

// Transports: use the backend proxy.
const arcTestnetTransport = fallback(
  ARC_PUBLIC_RPCS.map((url) => http(url)),
)

export const config = createConfig({
  chains: [arcTestnet, mainnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: arcTestnetTransport,
    [mainnet.id]: http(),
  },
})
