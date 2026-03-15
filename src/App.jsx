import React, { useState } from 'react'
import { useWallet } from './hooks/useWallet'
import { useDEX } from './hooks/useDEX'
import Header from './components/Header'
import SwapPanel from './components/SwapPanel'
import LiquidityPanel from './components/LiquidityPanel'
import FaucetPanel from './components/FaucetPanel'
import LeaderboardPanel from './components/LeaderboardPanel'
import UserDashboard from './components/UserDashboard'
import styles from './styles/App.module.css'

export default function App() {
  const wallet = useWallet()
  const dex    = useDEX(wallet.signer, wallet.account)
  const [tab, setTab] = useState('swap')
  const [ref, setRef] = useState('')

  const tabs = [
    { id: 'swap',        label: '⇄  Swap' },
    { id: 'liquidity',   label: '◈  Pool' },
    { id: 'faucet',      label: '⬡  Faucet' },
    { id: 'leaderboard', label: '◆  Rank' },
  ]

  return (
    <div className={styles.app}>
      <div className={styles.bg} />
      <Header wallet={wallet} userInfo={dex.userInfo} streak={dex.streak} />
      <main className={styles.main}>

        {wallet.account && !wallet.isCorrectNetwork && (
          <div className={styles.networkBanner}>
            <span>⚠ Wrong network — switch to BNB Smart Chain Testnet</span>
            <button onClick={wallet.switchNetwork} className={styles.switchBtn}>Switch Network</button>
          </div>
        )}

        {wallet.account && wallet.isCorrectNetwork &&
         dex.userInfo && !dex.userInfo.registered && (
          <div className={styles.registerBanner}>
            <span className={styles.regTitle}>🚀 Register to start earning DRIFT points</span>
            <input className={styles.regInput} placeholder="Referral code (optional)"
              value={ref} onChange={e => setRef(e.target.value)} />
            <button className={styles.regBtn} onClick={() => dex.register(ref)} disabled={dex.loading}>
              {dex.loading ? 'Registering…' : 'Register + 250 PTS'}
            </button>
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.panels}>
            <nav className={styles.tabs}>
              {tabs.map(t => (
                <button key={t.id}
                  className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
                  onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </nav>
            <div className={styles.panelContent}>
              {tab === 'swap'        && <SwapPanel      wallet={wallet} dex={dex} />}
              {tab === 'liquidity'   && <LiquidityPanel wallet={wallet} dex={dex} />}
              {tab === 'faucet'      && <FaucetPanel    wallet={wallet} dex={dex} />}
              {tab === 'leaderboard' && <LeaderboardPanel dex={dex} wallet={wallet} />}
            </div>
          </div>
          <aside className={styles.sidebar}>
            <UserDashboard wallet={wallet} dex={dex} />
          </aside>
        </div>
      </main>

      {dex.txHash && (
        <div className={styles.txToast}>
          <span>Transaction submitted</span>
          <a href={`https://testnet.bscscan.com/tx/${dex.txHash}`} target="_blank" rel="noreferrer">
            View on BscScan ↗
          </a>
        </div>
      )}
    </div>
  )
}
