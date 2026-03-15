import React, { useState, useEffect } from 'react'
import styles from '../styles/Panel.module.css'

export default function LeaderboardPanel({ dex, wallet }) {
  const [board,   setBoard]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dex.dex) return
    setLoading(true)
    dex.getLeaderboard().then(data => { setBoard(data); setLoading(false) })
  }, [dex.dex])

  const medals = ['🥇','🥈','🥉']

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>LEADERBOARD</h2>
        <span className={styles.pointsBadge}>Top traders → airdrop</span>
      </div>
      <div className={styles.infoBox}>
        Swap +100 · Liquidity +500 · Referral +200 · 7-day streak 2× · 50 swaps 1.25× · 100 swaps 1.5×.
        Top point holders receive the mainnet DRIFT airdrop.
      </div>
      {loading ? (
        <div className={styles.loadingRow}>Loading rankings…</div>
      ) : board.length === 0 ? (
        <div className={styles.emptyState}>No traders yet — be the first! 🚀</div>
      ) : (
        <div className={styles.leaderList}>
          {board.map((entry, i) => {
            const isMe = wallet.account &&
              entry.address.toLowerCase() === wallet.account.toLowerCase()
            return (
              <div key={entry.address} className={`${styles.leaderRow} ${isMe ? styles.leaderRowMe : ''}`}>
                <span className={styles.leaderRank}>{medals[i] || `#${i+1}`}</span>
                <span className={styles.leaderAddr}>
                  {entry.address.slice(0,8)}…{entry.address.slice(-6)}
                  {isMe && <span className={styles.youBadge}>YOU</span>}
                </span>
                <span className={styles.leaderPoints}>
                  {entry.points.toLocaleString()}
                  <span style={{fontSize:9,marginLeft:4,color:'var(--text-mute)',fontFamily:'var(--font-mono)'}}>PTS</span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
