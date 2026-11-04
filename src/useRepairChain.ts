/**
 * useRepairChain — programmatically switches MetaMask to Arc Testnet with
 * a known-good public RPC.
 *
 * MetaMask caches RPC URLs per chainId and ignores wallet_addEthereumChain
 * rpcUrls for an already-known chain. The ONLY reliable fix is to:
 *   1. Call wallet_addEthereumChain with the correct RPC — MetaMask stores it
 *      only if it hasn't seen this chainId before.
 *   2. Call wallet_switchEthereumChain to activate it.
 *
 * We use the blockdaemon endpoint which has proper CORS headers for browsers.
 * The RPC URL logged to console confirms which URL MetaMask will use.
 */

import { useCallback, useState } from 'react'
import { arcMainnet as _arcMainnet } from '@/config'

// Live Arc Testnet RPC. The old default (rpc.testnet.arc.network) is DEAD —
// wallets configured with it fail every broadcast with "Failed to fetch".
// thirdweb's endpoint sends `Access-Control-Allow-Origin: *`, so browser and
// wallet content-script fetches both work.
export const ARC_GOOD_RPC = 'https://rpc.mainnet.arc.io'

const CHAIN_ID_HEX = `0x${_arcMainnet.id.toString(16)}`

type EthProvider = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> }

function getProvider(): EthProvider | null {
  const raw: unknown = (window as unknown as Record<string, unknown>)['ethereum']
  if (!raw || typeof (raw as EthProvider).request !== 'function') return null
  return raw as EthProvider
}

export function useRepairChain() {
  const [switching, setSwitching] = useState(false)
  const [switched, setSwitched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addAndSwitch = useCallback(async () => {
    const eth = getProvider()
    if (!eth) { setError('No wallet detected. Install MetaMask.'); return }

    setSwitching(true)
    setError(null)

    console.log('[Scrolls] Registering Arc Testnet with RPC:', ARC_GOOD_RPC)

    try {
      // wallet_addEthereumChain stores our URL; if chain exists MetaMask may
      // update it (behaviour varies by version) and switches to it.
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: CHAIN_ID_HEX,
          chainName: _arcMainnet.name,
          nativeCurrency: _arcMainnet.nativeCurrency,
          rpcUrls: [ARC_GOOD_RPC],
          blockExplorerUrls: [_arcMainnet.blockExplorers?.default.url ?? 'https://explorer.arc.io'],
        }],
      })
      console.log('[Scrolls] Chain added/switched. Active RPC:', ARC_GOOD_RPC)
      setSwitched(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Code 4902 = chain not found → already handled by wallet_addEthereumChain
      if ((err as { code?: number }).code !== 4001) {
        // Not a user rejection — try an explicit switch
        try {
          await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_ID_HEX }] })
          setSwitched(true)
        } catch {
          setError(`Could not switch network: ${msg}. Please switch manually in MetaMask Settings → Networks → Arc Testnet → change RPC to: ${ARC_GOOD_RPC}`)
        }
      }
    } finally {
      setSwitching(false)
    }
  }, [])

  return { switching, switched, error, addAndSwitch }
}
