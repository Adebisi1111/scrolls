import { Link, useLocation } from 'react-router-dom'
import { ConnectKitButton } from 'connectkit'
import { BookOpen, PenLine, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { useRepairChain, ARC_GOOD_RPC } from '@/useRepairChain'

const ARC_MAINNET_ID = 5042 // arc-studio-allow-onchain-literal

export default function NavBar() {
  const { pathname } = useLocation()
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switching, switched, error, addAndSwitch } = useRepairChain()

  const wrongChain = isConnected && chainId !== ARC_MAINNET_ID
  const showBanner = isConnected && (wrongChain || error)

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <BookOpen size={20} style={{ color: 'var(--accent)' }} />
            <span className="display text-base font-bold" style={{ color: 'var(--ink)' }}>
              Scrolls
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/publish"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors min-h-[44px]"
              style={{
                background: pathname === '/publish' ? 'var(--surface-muted)' : 'transparent',
                color: 'var(--ink-2)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
              }}
            >
              <PenLine size={14} />
              Publish
            </Link>

            <ConnectKitButton.Custom>
              {({ isConnected: ck, show, address }) => (
                <button
                  onClick={show}
                  className="rounded-full px-4 py-2 text-sm font-semibold min-h-[44px]"
                  style={{
                    background: ck ? 'var(--surface-muted)' : 'var(--accent)',
                    color: ck ? 'var(--ink)' : 'white',
                    border: ck ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {ck && address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connect Wallet'}
                </button>
              )}
            </ConnectKitButton.Custom>
          </div>
        </div>
      </header>

      {/* Network fix banner — shown when wallet is connected to wrong chain or RPC switch failed */}
      {showBanner && !switched && (
        <div
          className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-sm"
          style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa' }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertTriangle size={15} style={{ color: '#c2410c', flexShrink: 0 }} />
            {error ? (
              <span style={{ color: '#9a3412' }} className="truncate">
                {error}
                <span className="ml-2 font-mono text-xs opacity-70">{ARC_GOOD_RPC}</span>
              </span>
            ) : (
              <span style={{ color: '#9a3412' }}>
                Wrong network detected. Click to switch MetaMask to Arc Testnet.
              </span>
            )}
          </div>
          <button
            onClick={() => { void addAndSwitch() }}
            disabled={switching}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{ background: '#c2410c', color: 'white', opacity: switching ? 0.6 : 1 }}
          >
            <RefreshCw size={12} className={switching ? 'animate-spin' : ''} />
            {switching ? 'Switching…' : 'Fix Network'}
          </button>
        </div>
      )}
    </>
  )
}
