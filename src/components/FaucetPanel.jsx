import React, { useState } from 'react'
import styles from '../styles/Panel.module.css'

const TOKENS = ['tWBNB', 'tUSDT', 'tBUSD']
const DESC = {
  tWBNB: 'Wrapped BNB — base trading pair',
  tUSDT: 'Tether USD — major stablecoin',
  tBUSD: 'Binance USD — decentralised stable',
}

export default function FaucetPanel({ wallet, dex }) {
  const [claimed, setClaimed] = useState({})

  const handleClaim = async (sym) => {
    await dex.faucet(sym)
    setClaimed(c => ({ ...c, [sym]: true }))
    setTimeout(() => setClaimed(c => ({ ...c, [sym]: false })), 5000)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>FAUCET</h2>
        <span className={styles.pointsBadge}>Free testnet tokens</span>
      </div>
      <div className={styles.infoBox}>
        Claim 1,000 of each test token every 24 hours. Use them to swap and add liquidity to earn DRIFT points.
      </div>
      <div className={styles.faucetList}>
        {TOKENS.map(sym => (
          <div key={sym} className={styles.faucetRow}>
            <div className={styles.faucetInfo}>
              <span className={styles.tokenSymbol}>{sym}</span>
              <span style={{fontSize:11,color:'var(--text-dim)',fontFamily:'var(--font-mono)'}}>{DESC[sym]}</span>
              <span style={{fontSize:10,color:'var(--text-mute)',fontFamily:'var(--font-mono)',marginTop:2}}>
                Balance: <span className="mono">{dex.balances[sym] ? Number(dex.balances[sym]).toFixed(2) : '—'}</span>
              </span>
            </div>
            <button className={styles.faucetBtn} onClick={() => handleClaim(sym)}
              disabled={!wallet.account || !wallet.isCorrectNetwork || dex.loading || claimed[sym]}>
              {claimed[sym] ? '✓ Claimed' : 'Claim 1,000'}
            </button>
          </div>
        ))}
      </div>
      <div className={styles.faucetNote}>24h cooldown per token · Resets automatically</div>
    </div>
  )
}
